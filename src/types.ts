import { TRoute } from "./router";
import { TAction } from "./actions";
import { EScreenSize } from "./routes/common/screenSize";
import { TRoutePart } from "./routes/home/home";

export enum EProcessState {
  NOT_STARTED = "notStarted",
  IN_PROGRESS = "inProgress",
  READY = "ready",
  ERROR = "error",
}

export type TAppState =
  | TNotStartedAppState
  | TInProgressAppState
  | TReadyAppState
  | TErrorAppState

export type TReadyAppState = {
  appState: EProcessState.READY
  route: TRoute,
  screenSize: EScreenSize,
  pointerState: {
    pointerYdown?: number
    pointerXdown?: number
    pointerMiddleDown?: number
  } | null
  timetableState: TTimetableState,
  modalState: TModalState
}


export enum EModalState {
  MODAL_OPEN = "modalOpen",
  MODAL_CLOSED = "modalClosed",
}

export type TModalState = 
  | { state: EModalState.MODAL_CLOSED }
  | { state: EModalState.MODAL_OPEN, data: TModalData }

export type TModalData = 
  | {  state: EProcessState.ERROR, error: string}
  | {  state: EProcessState.NOT_STARTED}
  | {  state: EProcessState.IN_PROGRESS}
  | ({  state: EProcessState.READY, })

export type TTimetableState =
  | { state: EProcessState.NOT_STARTED }
  | { state: EProcessState.IN_PROGRESS }
  | { state: EProcessState.ERROR, error: string }
  | { state: EProcessState.READY, data: TTimetableData }

export type TSegment = {
  from: string,
  to: string
}

export type TSegmentNumeric = {
  from: number,
  to: number
}

export type TStopData = { id: string, name: string, coordinates: { lat: string, lon: string } }

export type TTimetableData = {
  routeParts: TRoutePart[];
  contentWidth: number,
  contentHeight: number,
  rulerWidth: number
  timetableWidth: number;
  timetableHeight: number;
  stops: TStopData[],
  zoomX: number,
  zoomY: number,
  zoomedPositionX: number
  zoomedPositionY: number;
  rulerYdata: TRulerYdata[]
  rulerXdata: TRulerXdata[]
  stationTrackData: TStationTrackData[]
  moveStarted: boolean,
  moveX: number,
  moveY: number
}

export enum ERulerYlineType {
  INVISIBLE = "invisible",
  SECOND = "second",
  FIVE_MINUTES = "fiveMinutes",
  HOUR = "hour",
}

export type TRulerYdata = { key: string, type: ERulerYlineType, y: number, timeString: string, timeMinutes: number }
export type TRulerXdata = { key: string, x: number, id: string, name: string, coordinates: { lat: string, lon: string } }
export type TStationTrackData = { key: string, x: number }

export enum EMenuType {
  SIMPLE = "simple",
  PARENT = "parent",
  CHILD = "child",
  ROOT = 'root'
}

export enum ESectionMenuDisplayType {
  MAIN = "main",
  SECONDARY = "secondary",
}

export type TSectionMenuItem = { id: string, mobileDisplayType: ESectionMenuDisplayType, label: string, isActive: boolean, action: TAction }

type TMenuItemCommonProps = {
  id: string,
  label: string,
  isActive: boolean,
  action: TAction
}
export type TRootMenuItem = { id: 'root', type: EMenuType.ROOT, children: string[] }
export type TParentMenuItem = { type: EMenuType.PARENT, children: string[] } & TMenuItemCommonProps
export type TChildMenuItem = { type: EMenuType.CHILD, children: string[] } & TMenuItemCommonProps
export type TSimpleMenuItem = { type: EMenuType.SIMPLE } & TMenuItemCommonProps
export type TMenuItem =
  | TRootMenuItem
  | TChildMenuItem
  | TParentMenuItem
  | TSimpleMenuItem

export type TNotStartedAppState = { appState: EProcessState.NOT_STARTED }
export type TInProgressAppState = { appState: EProcessState.IN_PROGRESS }
export type TErrorAppState = { appState: EProcessState.ERROR, errorMessage: string }