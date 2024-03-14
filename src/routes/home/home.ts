import {ERoute} from "../../router";
import {
    EModalState,
    EProcessState,
    ERouteSegmentType,
    ERulerYlineType,
    TInternalState,
    TReadyAppState,
    TRouteData,
    TRouteSegment,
    TRouteSegmentNumeric,
    TRulerYdata,
    TStationData,
    TTimetableData
} from "../../types";
import {all, fork, put, select} from "redux-saga/effects";
import {actionListenerLoop, screenResize, TActionMap,} from "../../sagas/uiSaga";
import {config} from "../../config";
import {screenSize} from "../common/screenSize";
import {TResizeEventPayload} from "../../services/resizeObserver";
import {actions, EActionType} from "../../actions";
import {clamp, generateRandomString} from "../../utils/utils";
import {produce} from "immer";


export type TRoutePart = TRouteSegmentNumeric & {
    segmentCoordinates: {
        from: { x: number, y: number }, to: { x: number, y: number }
    }
}

export function* home(screenDimensions: TResizeEventPayload): Generator<any, void, any> {
    const internalState: TInternalState = yield select((state) => state.internal);

    const routeSelector = {
        options: Object.values(internalState.routes).map(route => ({id: route.routeId, label: route.routeName})),
        value: Object.values(internalState.routes)[0].routeId
    }
    const initialState = {
        appState: EProcessState.READY as const,
        route: {routeName: ERoute.HOME},
        screenSize: screenSize(screenDimensions),
        pointerState: null,
        timetableState: {state: EProcessState.NOT_STARTED as const},
        modalState: {state: EModalState.MODAL_CLOSED as const},
        routeSelector
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
    yield put(actions.requestTimetable({routeId: initialState.routeSelector.value}))
}


export const modalActions: TActionMap = {
    [EActionType.OPEN_MODAL]: function* (state: TReadyAppState, action: ReturnType<typeof actions.openModal>) {
        if (state.modalState.state !== EModalState.MODAL_OPEN) {

            return yield put(actions.setAppState(
                produce(state, (nextState) => {
                    nextState.modalState = {
                        state: EModalState.MODAL_OPEN,
                        data: {state: EProcessState.READY, name: "transfer info (not implemented)"} as any
                    }
                })
            ))
        }
    },
    [EActionType.SHOW_TRANSFER_INFO]: function* (state: TReadyAppState, action: ReturnType<typeof actions.showTransferInfo>) {
        if (state.modalState.state !== EModalState.MODAL_OPEN) {

            return yield put(actions.setAppState(
                produce(state, (nextState) => {
                    nextState.modalState = {
                        state: EModalState.MODAL_OPEN,
                        data: {state: EProcessState.READY, name: "transfer info (not implemented)"} as any
                    }
                })
            ))
        }
    },
    [EActionType.SHOW_STATION_INFO]: function* (state: TReadyAppState, action: ReturnType<typeof actions.showStationInfo>) {
        if (state.modalState.state !== EModalState.MODAL_OPEN) {

            const oldState = state.modalState;
            yield put(actions.requestStationInfo({stationId: action.payload.stationId}))

            return yield put(actions.setAppState(
                produce(state, (nextState) => {
                    nextState.modalState = {state: EModalState.MODAL_OPEN, data: {state: EProcessState.IN_PROGRESS}}
                })
            ))
        }
    },
    [EActionType.STATION_INFO_RECEIVED]: function* (state: TReadyAppState, action: ReturnType<typeof actions.stationInfoReceived>) {
        if (state.modalState.state === EModalState.MODAL_OPEN) {

            const oldState = state.modalState.data;
            return yield put(actions.setAppState(
                produce(state, (nextState) => {
                    nextState.modalState = {
                        state: EModalState.MODAL_OPEN,
                        data: {state: EProcessState.READY, ...action.payload}
                    }
                })
            ))
        }
    },
    [EActionType.CLOSE_MODAL]: function* (state: TReadyAppState, action: ReturnType<typeof actions.closeModal>) {
        if (state.modalState.state === EModalState.MODAL_OPEN) {

            const oldState = state.modalState.data;
            return yield put(actions.setAppState(
                produce(state, (nextState) => {
                    nextState.modalState = {state: EModalState.MODAL_CLOSED}
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
                    nextState.timetableState = {
                        state: EProcessState.READY,
                        data: {...oldState, moveStarted: true, moveX: 0, moveY: 0}
                    }
                })
            ))
        }
    },
    [EActionType.TIMETABLE_POINTER_UP]: function* (state: TReadyAppState, action: ReturnType<typeof actions.timetablePointerUp>) {
        if (state.timetableState.state === EProcessState.READY) {

            const oldState = state.timetableState.data;
            return yield put(actions.setAppState(
                produce(state, (nextState) => {
                    nextState.timetableState = {
                        state: EProcessState.READY,
                        data: {...oldState, moveStarted: false, moveX: 0, moveY: 0}
                    }
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
                    nextState.timetableState = {
                        state: EProcessState.READY,
                        data: {...oldState, zoomedPositionX: newZoomedPositionX, zoomedPositionY: newZoomedPositionY}
                    }
                })
            ))
        }
    },
}

export const timetableLoaderActions: TActionMap = {
    [EActionType.REQUEST_TIMETABLE]: function* (state: TReadyAppState, action: ReturnType<typeof actions.requestTimetable>) {
        return yield put(actions.setAppState(
            produce(state, (nextState) => {
                nextState.routeSelector.value = action.payload.routeId
                nextState.timetableState = {state: EProcessState.IN_PROGRESS}
            })
        ))
    },
    [EActionType.TIMETABLE_RESPONSE]: function* (state: TReadyAppState, action: ReturnType<typeof actions.timetableResponse>) {
        const data = action.payload;

        return yield put(actions.setAppState(
            produce(state, (nextState) => {
                nextState.timetableState = {
                    state: EProcessState.READY,
                    data: generateInitialTimetableData(data)
                }
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
                    nextState.timetableState = {
                        state: EProcessState.READY,
                        data: {...oldState, zoomX: newZoom, zoomedPositionX}
                    }
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
                    nextState.timetableState = {
                        state: EProcessState.READY,
                        data: {...oldState, zoomY: newZoom, zoomedPositionY}
                    }
                })
            ))
        }
    },
}

export const pointerActions: TActionMap = {
    [EActionType.POINTER_X_DOWN]: function* (state: TReadyAppState, action: ReturnType<typeof actions.pointerXdown>) {
        return yield put(actions.setAppState(
            produce(state, (nextState) => {
                nextState.pointerState = {pointerXdown: action.payload.start}
            })
        ))
    },
    [EActionType.POINTER_Y_DOWN]: function* (state: TReadyAppState, action: ReturnType<typeof actions.pointerYdown>) {
        return yield put(actions.setAppState(
            produce(state, (nextState) => {
                nextState.pointerState = {pointerYdown: action.payload.start}
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

function generateInitialTimetableData(data: TRouteData): TTimetableData {
    const contentHeight = 804; //hardcoded
    const contentWidth = 1404; //hardcoded
    const rulerWidth = 50; //hardcoded

    const timetableWidth = contentWidth - rulerWidth;
    const timetableHeight = contentHeight - rulerWidth;

    const yScaleFactor = calculateYscaleFactor(data, timetableHeight)

    const stationTrackDistance = calculateStationTrackDistance(timetableWidth, data)
    const rulerYdata = generateYmarkerData(data, timetableHeight, yScaleFactor)

    const rulerXdata = data.stations.map((stop, i) => ({...stop, key: stop.stationId, x: i * stationTrackDistance,}))

    return {
        routeParts: generateRoute(data, yScaleFactor, stationTrackDistance, rulerXdata),
        contentHeight,
        contentWidth,
        rulerWidth,
        timetableWidth,
        timetableHeight,
        stops: data.stations,
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

function generateRouteParts(data: {
    segments: TRouteSegmentNumeric[],
    stations: TStationData[]
}, stationTrackDistance: number, rulerXdata: (TStationData & { x: number })[]): TRoutePart[] {
    const routeParts: TRoutePart[] = []

    rulerXdata.forEach((station, i) => {
        const stationId = station.stationId;
        const segments = data.segments.filter((segment) =>
            ((segment.type === ERouteSegmentType.STOP || segment.type === ERouteSegmentType.TECHNICAL_STOP) && segment.stopId === stationId)
            || (segment.type === ERouteSegmentType.TRANSFER && segment.fromStopId === stationId))

        segments.forEach((segment) => {
            const segmentCoordinates = segment.type !== ERouteSegmentType.TRANSFER
                ? {
                    from: {y: segment.scaledFrom, x: i * stationTrackDistance},
                    to: {y: segment.scaledTo, x: (i) * stationTrackDistance}
                }
                : {
                    from: {y: segment.scaledFrom, x: (i) * stationTrackDistance},
                    to: {y: segment.scaledTo, x: (i + 1) * stationTrackDistance}
                }

            routeParts.push({
                ...segment, segmentCoordinates,
            })
        })

    })

    return routeParts
}

export function generateRoute(data: TRouteData, yScaleFactor: number, stationTrackDistance: number, rulerXdata: (TStationData & {
    x: number
})[]) {
    const segmentDataNumeric = segmentsToRelativePosition(data, yScaleFactor,)
    return generateRouteParts(segmentDataNumeric, stationTrackDistance, rulerXdata)
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


function calculateYscaleFactor(data: {
    segments: { [key: string]: TRouteSegment },
    segmentOrder: string[]
}, height: number) {

    const first = timeStringToMinutes(data.segments[data.segmentOrder[0]].from)
    const last = timeStringToMinutes(data.segments[data.segmentOrder[data.segmentOrder.length - 1]].to) - first
    return height / last
}

function setMarkerType(markerTime: number) {
    return markerTime % 60 === 0 ? ERulerYlineType.HOUR : ERulerYlineType.FIVE_MINUTES
}

function generateYmarkerData(data: {
    segments: { [key: string]: TRouteSegment },
    segmentOrder: string[]
}, height: number, scaleFactor: number): TRulerYdata[] {
    const start = timeStringToMinutes(data.segments[data.segmentOrder[0]].from);
    const end = timeStringToMinutes(data.segments[data.segmentOrder[data.segmentOrder.length - 1]].to);
    const routeTime = end - start

    const firstMarkerPosition = start % 5
    const lastMarkerPosition = routeTime - routeTime % 5
    const timeOffset = start + firstMarkerPosition

    const firstMarkerPositionScaled = (firstMarkerPosition) * scaleFactor
    const lastMarkerPositionScaled = lastMarkerPosition * scaleFactor

    const firstMarker = {
        key: generateRandomString(3),
        type: setMarkerType(firstMarkerPosition),
        y: firstMarkerPositionScaled,
        timeString: minutesToTimeString(timeOffset),
        timeMinutes: timeOffset
    }
    const markers = [firstMarker]

    while (markers[markers.length - 1].y < lastMarkerPositionScaled) {

        const nextMarkerPosition = markers[markers.length - 1].y + 5
        const nextMarkerTimeMinutes = markers[markers.length - 1].timeMinutes + 5
        const nextMarkerTimeString = minutesToTimeString(nextMarkerTimeMinutes)
        const nextMarkerPositionScaled = markers[markers.length - 1].y + 5 * scaleFactor
        const nextMarkerType = nextMarkerPosition % 60 === 0 ? ERulerYlineType.HOUR : ERulerYlineType.FIVE_MINUTES
        markers.push({
            key: generateRandomString(3),
            type: nextMarkerType,
            y: nextMarkerPositionScaled,
            timeString: nextMarkerTimeString,
            timeMinutes: nextMarkerTimeMinutes
        })
    }
    return markers
}

function segmentsToRelativePosition(data: TRouteData, scaleFactor: number): {
    segments: TRouteSegmentNumeric[],
    stations: TStationData[]
} {
    const first = timeStringToMinutes(data.segments[data.segmentOrder[0]].from)

    return {
        segments: data.segmentOrder.map(routeSegmentId => {
            const routeSegment = data.segments[routeSegmentId]
            return {
                ...data.segments[routeSegmentId],
                scaledFrom: (timeStringToMinutes(routeSegment.from) - first) * scaleFactor,
                scaledTo: (timeStringToMinutes(routeSegment.to) - first) * scaleFactor
            }
        }),
        stations: data.stations
    }
}

function calculateStationTrackDistance(timetableWidth: number, data: {
    segments: { [key: string]: TRouteSegment },
    segmentOrder: string[]
}) {
    const numberOfTransfers = Object.values(data.segments).filter(segment => segment.type === ERouteSegmentType.TRANSFER).length;

    const stationTrackGap_ = (timetableWidth - 1) / numberOfTransfers;
    return stationTrackGap_ > config.defaultTrackGap ? stationTrackGap_ : config.defaultTrackGap
}
