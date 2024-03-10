import { ERoute } from "../../router";
import { EModalState, EProcessState, ERulerYlineType, TReadyAppState, TRulerYdata, TSegment, TSegmentNumeric, TStopData, TTimetableData } from "../../types";
import { all, fork, put, select } from "redux-saga/effects";
import { TActionMap, actionListenerLoop, screenResize, } from "../../sagas/uiSaga";
import { config } from "../../config";
import { screenSize } from "../common/screenSize";
import { TResizeEventPayload } from "../../services/resizeObserver";
import { EActionType, actions } from "../../actions";
import { clamp, generateRandomString } from "../../utils/utils";
import { produce } from "immer";

export enum ERouteParts {
  SEGMENT = 'segment',
  STOP = 'stop',
  // TRACK_CHANGE = 'trackChange'
}

export type TRoutePart = {
  key: string,
  transfer: { type: ERouteParts.SEGMENT, from: { x: number, y: number }, to: { x: number, y: number } },
  stop: { type: ERouteParts.STOP, from: { x: number, y: number }, to: { x: number, y: number } }
  // { type: ERouteParts.TRACK_CHANGE, key: string, from: number, to: number }
}

export function* home(screenDimensions: TResizeEventPayload): Generator<any, void, TReadyAppState> {
  const initialState = {
    appState: EProcessState.READY as const,
    route: { routeName: ERoute.HOME },
    screenSize: screenSize(screenDimensions),
    pointerState: null,
    timetableState: { state: EProcessState.NOT_STARTED as const },
    modalState: { state: EModalState.MODAL_CLOSED as const }
  }
  yield put(actions.setAppState(initialState))

  yield all([
    fork(actionListenerLoop,
      {
        ...screenResize,
        ...pointerActions,
        ...timetableLoaderActions,
        ...timetableZoomActions,
        ...timetableMoveActions,
        ...modalActions,
      })
  ])
  yield put(actions.requestTimetable({ routeId: 'bla' }))
}


export const modalActions: TActionMap = {
  [EActionType.OPEN_MODAL]: function* (state: TReadyAppState, action: ReturnType<typeof actions.openModal>) {
    if (state.modalState.state !== EModalState.MODAL_OPEN) {
      
      return yield put(actions.setAppState(
        produce(state, (nextState) => {
          nextState.modalState = { state: EModalState.MODAL_OPEN, data: { state: EProcessState.READY, name: "transfer info (not implemented)" } as any }
        })
      ))
    }
  },
  [EActionType.SHOW_STATION_INFO]: function* (state: TReadyAppState, action: ReturnType<typeof actions.showStationInfo>) {
    if (state.modalState.state !== EModalState.MODAL_OPEN) {

      const oldState = state.modalState;
      yield put(actions.requestStationInfo({ stationId: action.payload.stationId }))
      
      return yield put(actions.setAppState(
        produce(state, (nextState) => {
          nextState.modalState = { state: EModalState.MODAL_OPEN, data: { state: EProcessState.IN_PROGRESS } }
        })
      ))
    }
  },
  [EActionType.STATION_INFO_RECEIVED]: function* (state: TReadyAppState, action: ReturnType<typeof actions.stationInfoReceived>) {
    console.log("STATION_INFO_RECEIVED", action.payload)
    if (state.modalState.state === EModalState.MODAL_OPEN) {

      const oldState = state.modalState.data;
      return yield put(actions.setAppState(
        produce(state, (nextState) => {
          nextState.modalState = { state: EModalState.MODAL_OPEN, data: { state: EProcessState.READY, ...action.payload } }
        })
      ))
    }
  },
  [EActionType.CLOSE_MODAL]: function* (state: TReadyAppState, action: ReturnType<typeof actions.closeModal>) {
    if (state.modalState.state === EModalState.MODAL_OPEN) {

      const oldState = state.modalState.data;
      return yield put(actions.setAppState(
        produce(state, (nextState) => {
          nextState.modalState = { state: EModalState.MODAL_CLOSED }
        })
      ))
    }
  },
}

export const timetableMoveActions: TActionMap = {
  [EActionType.TIMETABLE_POINTER_DOWN]: function* (state: TReadyAppState, action: ReturnType<typeof actions.timetablePointerDown>) {
    if (state.timetableState.state === EProcessState.READY) {

      const oldState = state.timetableState.data;
      return yield put(actions.setAppState(

        produce(state, (nextState) => {
          nextState.timetableState = { state: EProcessState.READY, data: { ...oldState, moveStarted: true, moveX: 0, moveY: 0 } }
        })
      ))
    }
  },
  [EActionType.TIMETABLE_POINTER_UP]: function* (state: TReadyAppState, action: ReturnType<typeof actions.timetablePointerUp>) {
    if (state.timetableState.state === EProcessState.READY) {

      const oldState = state.timetableState.data;
      return yield put(actions.setAppState(

        produce(state, (nextState) => {
          nextState.timetableState = { state: EProcessState.READY, data: { ...oldState, moveStarted: false, moveX: 0, moveY: 0 } }
        })
      ))
    }
  },
  [EActionType.TIMETABLE_POINTER_MOVE]: function* (state: TReadyAppState, action: ReturnType<typeof actions.timetablePointerMove>) {
    if (state.timetableState.state === EProcessState.READY && state.timetableState.data.moveStarted) {

      const oldState = state.timetableState.data;
      const newZoomedPositionX = state.timetableState.data.zoomX !== 1 ? state.timetableState.data.zoomedPositionX + action.payload.x : state.timetableState.data.zoomedPositionX
      const newZoomedPositionY = state.timetableState.data.zoomY !== 1 ? state.timetableState.data.zoomedPositionY + action.payload.y : state.timetableState.data.zoomedPositionY

      return yield put(actions.setAppState(

        produce(state, (nextState) => {
          nextState.timetableState = { state: EProcessState.READY, data: { ...oldState, zoomedPositionX: newZoomedPositionX, zoomedPositionY: newZoomedPositionY } }
        })
      ))
    }
  },
}

export const timetableLoaderActions: TActionMap = {
  [EActionType.REQUEST_TIMETABLE]: function* (state: TReadyAppState, action: ReturnType<typeof actions.requestTimetable>) {
    return yield put(actions.setAppState(
      produce(state, (nextState) => {
        nextState.timetableState = { state: EProcessState.IN_PROGRESS }
      })
    ))
  },
  [EActionType.TIMETABLE_RESPONSE]: function* (state: TReadyAppState, action: ReturnType<typeof actions.timetableResponse>) {
    const [segments, stops] = action.payload;

    return yield put(actions.setAppState(
      produce(state, (nextState) => {
        nextState.timetableState = { state: EProcessState.READY, data: generateInitialTimetableData(segments, stops) }
      })
    ))
  }
}

export const timetableZoomActions: TActionMap = {
  [EActionType.ZOOM_X]: function* (state: TReadyAppState, action: ReturnType<typeof actions.zoomX>) {

    if ((state.pointerState?.pointerMiddleDown || state.pointerState?.pointerXdown) && state.timetableState.state === EProcessState.READY) {
      const oldState = state.timetableState.data;
      const newZoom = clamp(oldState.zoomX + action.payload.moveX / 100, 1, 3)

      const pointerXdown = state.pointerState?.pointerXdown ? state.pointerState.pointerXdown : 0
      const zoomedPositionX = -(pointerXdown - pointerXdown / newZoom)

      return yield put(actions.setAppState(
        produce(state, (nextState) => {
          nextState.timetableState = { state: EProcessState.READY, data: { ...oldState, zoomX: newZoom, zoomedPositionX } }
        })
      ))
    }
  },
  [EActionType.ZOOM_Y]: function* (state: TReadyAppState, action: ReturnType<typeof actions.zoomY>) {
    if ((state.pointerState?.pointerMiddleDown || state.pointerState?.pointerYdown) && state.timetableState.state === EProcessState.READY) {
      const oldState = state.timetableState.data;
      const newZoom = clamp(oldState.zoomY + action.payload.moveY / 100, 1, 3)

      const pointerYdown = state.pointerState?.pointerYdown ? state.pointerState.pointerYdown : 0
      const zoomedPositionY = -(pointerYdown - pointerYdown / newZoom)


      return yield put(actions.setAppState(
        produce(state, (nextState) => {
          nextState.timetableState = { state: EProcessState.READY, data: { ...oldState, zoomY: newZoom, zoomedPositionY } }
        })
      ))
    }
  },
}

export const pointerActions: TActionMap = {
  [EActionType.POINTER_X_DOWN]: function* (state: TReadyAppState, action: ReturnType<typeof actions.pointerXdown>) {
    return yield put(actions.setAppState(
      produce(state, (nextState) => {
        nextState.pointerState = { pointerXdown: action.payload.start }
      })
    ))
  },
  [EActionType.POINTER_Y_DOWN]: function* (state: TReadyAppState, action: ReturnType<typeof actions.pointerYdown>) {
    return yield put(actions.setAppState(
      produce(state, (nextState) => {
        nextState.pointerState = { pointerYdown: action.payload.start }
      })
    ))
  },
  [EActionType.POINTER_UP]: function* (state: TReadyAppState, action: ReturnType<typeof actions.pointerUp>) {
    return yield put(actions.setAppState(
      produce(state, (nextState) => {
        nextState.pointerState = null
      })
    ))
  },
  [EActionType.POINTER_MOVE]: function* (state: TReadyAppState, action: ReturnType<typeof actions.pointerUp>) {
    return yield put(actions.setAppState(
      produce(state, (nextState) => {
        nextState.pointerState = null
      })
    ))
  }
}

function generateInitialTimetableData(segments: TSegment[], stops: TStopData[]): TTimetableData {
  const contentHeight = 804;
  const contentWidth = 1404;
  const rulerWidth = 50;

  const timetableWidth = contentWidth - rulerWidth;
  const timetableHeight = contentHeight - rulerWidth;

  const yScaleFactor = calculateYscaleFactor(segments, timetableHeight)

  const stationTrackDistance = calculateStationTrackDistance(timetableWidth, stops)
  const rulerYdata = generateYmarkerData(segments, timetableHeight, yScaleFactor)


  const stationTrackData = stops.map((stop, i) => ({ key: stop.id, x: i * stationTrackDistance }))
  const rulerXdata = stops.map((stop, i) => ({ ...stop, key: stop.id, x: i * stationTrackDistance, }))


  return {
    routeParts: generateRoute(segments, yScaleFactor, stationTrackDistance),
    contentHeight,
    contentWidth,
    rulerWidth,
    timetableWidth,
    timetableHeight,
    stationTrackData,
    stops,
    zoomX: 1,
    zoomY: 1,
    zoomedPositionX: 0,
    zoomedPositionY: 0,
    rulerYdata,
    rulerXdata,
    moveStarted: false,
    moveX: 0,
    moveY: 0
  }
}

function generateRouteParts(segments: TSegmentNumeric[], stationTrackDistance: number): TRoutePart[] {
  return segments.reduce((acc: TRoutePart[], segment, i) => {
    const segmentCoordinates = {
      from: { y: segment.from, x: i * stationTrackDistance },
      to: { y: segment.to, x: (i + 1) * stationTrackDistance }
    }

    acc.push({
      key: generateRandomString(3),
      transfer: { type: ERouteParts.SEGMENT as const, ...segmentCoordinates, },
      stop: {
        type: ERouteParts.STOP as const,
        from: { y: i > 0 ? segments[i - 1].to : 0, x: i * stationTrackDistance },
        to: { y: segment.from + 1, x: i * stationTrackDistance },
      }
    })
    return acc
  }, [])
}

export function generateRoute(segments: TSegment[], yScaleFactor: number, stationTrackDistance: number) {
  const segmentsNumeric = segmentsToRelativePosition(segments, yScaleFactor,)
  return generateRouteParts(segmentsNumeric, stationTrackDistance)
}

function timeStringToMinutes(time: string): number {
  const [hours, minutes, _] = time.split(":").map((segment, i) => parseInt(segment))
  return hours * 60 + minutes
}

function minutesToTimeString(timeInMinutes: number): string {
  const hours = Math.floor(timeInMinutes / 60)
  const minutes = timeInMinutes % 60

  return `${hours}:${minutes}:00`
}


function calculateYscaleFactor(segments: TSegment[], height: number) {
  const first = timeStringToMinutes(segments[0].from)
  const last = timeStringToMinutes(segments[segments.length - 1].to) - first
  return height / last
}

function setMarkerType(markerTime: number) {
  return markerTime % 60 === 0 ? ERulerYlineType.HOUR : ERulerYlineType.FIVE_MINUTES
}

function generateYmarkerData(segments: TSegment[], height: number, scaleFactor: number): TRulerYdata[] {
  const start = timeStringToMinutes(segments[0].from)
  const end = timeStringToMinutes(segments[segments.length - 1].to)
  const routeTime = end - start

  const firstMarkerPosition = start % 5
  const lastMarkerPosition = routeTime - routeTime % 5
  const timeOffset = start + firstMarkerPosition

  const firstMarkerPositionScaled = (firstMarkerPosition) * scaleFactor
  const lastMarkerPositionScaled = lastMarkerPosition * scaleFactor

  const firstMarker = { key: generateRandomString(3), type: setMarkerType(firstMarkerPosition), y: firstMarkerPositionScaled, timeString: minutesToTimeString(timeOffset), timeMinutes: timeOffset }
  const markers = [firstMarker]

  while (markers[markers.length - 1].y < lastMarkerPositionScaled) {

    const nextMarkerPosition = markers[markers.length - 1].y + 5
    const nextMarkerTimeMinutes = markers[markers.length - 1].timeMinutes + 5
    const nextMarkerTimeString = minutesToTimeString(nextMarkerTimeMinutes)
    const nextMarkerPositionScaled = markers[markers.length - 1].y + 5 * scaleFactor
    const nextMarkerType = nextMarkerPosition % 60 === 0 ? ERulerYlineType.HOUR : ERulerYlineType.FIVE_MINUTES
    markers.push({ key: generateRandomString(3), type: nextMarkerType, y: nextMarkerPositionScaled, timeString: nextMarkerTimeString, timeMinutes: nextMarkerTimeMinutes })
  }
  return markers
}

function segmentsToRelativePosition(segments: TSegment[], scaleFactor: number): TSegmentNumeric[] {
  const first = timeStringToMinutes(segments[0].from)

  return segments.map(({ from, to }) => {
    return { from: (timeStringToMinutes(from) - first) * scaleFactor, to: (timeStringToMinutes(to) - first) * scaleFactor }
  })
}

function calculateStationTrackDistance(timetableWidth: number, stops: TStopData[]) {
  const stationTrackGap_ = (timetableWidth - 1) / (stops.length - 1)
  return stationTrackGap_ > config.defaultTrackGap ? stationTrackGap_ : config.defaultTrackGap
}
