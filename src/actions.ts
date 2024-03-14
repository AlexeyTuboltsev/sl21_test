import {createAction} from '@reduxjs/toolkit'
import {TResizeEventPayload} from "./services/resizeObserver";
import {ELang} from "./services/i18n";
import {TNavigationRoute} from "./router";
import {TAppState, TInternalState, TRouteData, TStationData} from './types';

function withPayloadType<T>() {
  return (t: T) => ({ payload: t })
}

export enum EActionType {
  SET_APP_STATE = "SET_APP_STATE",
  INIT_STARTED = 'INIT_STARTED',
  INIT_ERROR = "INIT_ERROR",
  INIT_DONE = "INIT_DONE",
  INITIAL_DATA_LOADED = "INITIAL_DATA_LOADED",
  SCREEN_RESIZE = 'SCREEN_RESIZE',
  CHANGE_LANGUAGE = 'CHANGE_LANGUAGE',
  REQUEST_ROUTE_CHANGE = 'REQUEST_ROUTE_CHANGE',
  NOOP = "NOOP",
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  POINTER_Y_DOWN = 'POINTER_Y_DOWN',
  POINTER_X_DOWN = 'POINTER_X_DOWN',
  POINTER_MIDDLE_DOWN = 'POINTER_MIDDLE_DOWN',
  POINTER_UP = 'POINTER_UP',
  POINTER_MOVE = 'POINTER_MOVE',
  REQUEST_TIMETABLE = 'REQUEST_TIMETABLE',
  TIMETABLE_RESPONSE = 'TIMETABLE_RESPONSE',
  ZOOM_Y = 'ZOOM_Y' ,
  ZOOM_X = 'ZOOM_X' ,
  ZOOM_XY = 'ZOOM_XY' ,
  TIMETABLE_POINTER_DOWN = 'TIMETABLE_POINTER_DOWN',
  TIMETABLE_POINTER_UP = 'TIMETABLE_POINTER_UP',
  TIMETABLE_POINTER_MOVE = 'TIMETABLE_POINTER_MOVE',
  OPEN_MODAL = 'OPEN_MODAL',
  CLOSE_MODAL = 'CLOSE_MODAL',
  SHOW_STATION_INFO = 'SHOW_STATION_INFO',
  SHOW_TRANSFER_INFO = 'SHOW_TRANSFER_INFO',
  REQUEST_STATION_INFO ='REQUEST_STATION_INFO',
  STATION_INFO_RECEIVED = 'STATION_INFO_RECEIVED',
}

export type TAction = ReturnType<typeof actions[keyof typeof actions]>

export const actions = {
  noop: createAction(EActionType.NOOP),
  initStarted: createAction(EActionType.INIT_STARTED),
  initError: createAction(EActionType.INIT_ERROR, withPayloadType<{ errorMessage: string }>()),
  initDone: createAction(EActionType.INIT_DONE),
  initialDataLoaded:createAction(EActionType.INITIAL_DATA_LOADED, withPayloadType<TInternalState>()),
  setAppState: createAction(EActionType.SET_APP_STATE, withPayloadType<TAppState>()),

  pointerYdown: createAction(EActionType.POINTER_Y_DOWN, withPayloadType<{ start: number }>()),
  pointerXdown: createAction(EActionType.POINTER_X_DOWN, withPayloadType<{ start: number }>()),
  pointerMiddleDown: createAction(EActionType.POINTER_MIDDLE_DOWN, withPayloadType<{ startX: number, startY: number }>()),
  pointerUp: createAction(EActionType.POINTER_UP, withPayloadType<{ startX: number, startY: number }>()),
  pointerMove: createAction(EActionType.POINTER_MOVE, withPayloadType<{ startX: number, startY: number }>()),

  zoomY: createAction(EActionType.ZOOM_Y, withPayloadType<{moveY: number}>()),
  zoomX: createAction(EActionType.ZOOM_X, withPayloadType<{moveX: number}>()),
  zoomXY: createAction(EActionType.ZOOM_XY, withPayloadType<{moveX: number, moveY: number}>()),

  requestTimetable: createAction(EActionType.REQUEST_TIMETABLE, withPayloadType<{routeId:string}>()),
  timetableResponse: createAction(EActionType.TIMETABLE_RESPONSE, withPayloadType<TRouteData>()),

  
  timetablePointerDown: createAction(EActionType.TIMETABLE_POINTER_DOWN, withPayloadType<{x:number, y:number}>()),
  timetablePointerUp: createAction(EActionType.TIMETABLE_POINTER_UP, withPayloadType<{x:number, y:number}>()),
  timetablePointerMove: createAction(EActionType.TIMETABLE_POINTER_MOVE, withPayloadType<{x:number, y:number}>()),
  
  openModal: createAction(EActionType.OPEN_MODAL),
  closeModal: createAction(EActionType.CLOSE_MODAL),
  showStationInfo: createAction(EActionType.SHOW_STATION_INFO, withPayloadType<{stationId: string}>()),
  showTransferInfo: createAction(EActionType.SHOW_TRANSFER_INFO, withPayloadType<{segmentId: string}>()),
  
  requestStationInfo: createAction(EActionType.REQUEST_STATION_INFO, withPayloadType<{stationId: string}>()),
  stationInfoReceived: createAction(EActionType.STATION_INFO_RECEIVED, withPayloadType<{data:TStationData}>()),

  screenResize: createAction(EActionType.SCREEN_RESIZE, withPayloadType<TResizeEventPayload>()),
  changeLanguage: createAction(EActionType.CHANGE_LANGUAGE, withPayloadType<ELang>()),
  requestRouteChange: createAction(EActionType.REQUEST_ROUTE_CHANGE, withPayloadType<TNavigationRoute>()),
  externalLink: createAction(EActionType.EXTERNAL_LINK, withPayloadType<string>()),
}

