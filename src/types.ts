import {TNavigationRoute} from "./router";
import {TAction} from "./actions";
import {EScreenSize} from "./routes/common/screenSize";
import {TRoutePart} from "./routes/home/home";

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
    route: TNavigationRoute,
    screenSize: EScreenSize,
    pointerState: {
        pointerYdown?: number
        pointerXdown?: number
        pointerMiddleDown?: number
    } | null
    timetableState: TTimetableState,
    routeSelector: TRouteSelector
    modalState: TModalState
}

export type TRouteSelectorOption = {id: string, label: string}
export type TRouteSelector = { value:string, options: TRouteSelectorOption[] }

export enum EModalState {
    MODAL_OPEN = "modalOpen",
    MODAL_CLOSED = "modalClosed",
}

export type TModalState =
    | { state: EModalState.MODAL_CLOSED }
    | { state: EModalState.MODAL_OPEN, data: TModalData }

export type TModalData =
    | { state: EProcessState.ERROR, error: string }
    | { state: EProcessState.NOT_STARTED }
    | { state: EProcessState.IN_PROGRESS }
    | ({ state: EProcessState.READY, })

export type TTimetableState =
    | { state: EProcessState.NOT_STARTED }
    | { state: EProcessState.IN_PROGRESS }
    | { state: EProcessState.ERROR, error: string }
    | { state: EProcessState.READY, data: TTimetableData }

export type TInternalState = { stations: TStations, routes: TRoutes }

export type TRouteSegment =
    | {
    type: ERouteSegmentType.STOP | ERouteSegmentType.TECHNICAL_STOP
    segmentId: string,
    tripId: string,
    from: string,
    to: string,
    stopId: string,
}
    | {
    type: ERouteSegmentType.TRANSFER
    segmentId: string,
    tripId: string,
    from: string,
    to: string,
    fromStopId: string,
    toStopId: string,
}

export type TRouteSegmentNumeric = TRouteSegment & {
    scaledFrom: number,
    scaledTo: number
}

export type TTimetableData = {
    routeParts: TRoutePart[];
    contentWidth: number,
    contentHeight: number,
    rulerWidth: number
    timetableWidth: number;
    timetableHeight: number;
    stops: TStationData[],
    zoomX: number,
    zoomY: number,
    zoomedPositionX: number
    zoomedPositionY: number;
    rulerYdata: TRulerYdata[]
    rulerXdata: TRulerXdata[]
    moveStarted: boolean,
    moveX: number,
    moveY: number
}


export enum ERouteSegmentType {
    STOP = 'stop',
    TECHNICAL_STOP = "technical_stop",
    TRANSFER = 'transfer',
}

export type TRoute = { routeId: string, routeName: string }
export type TStations = { [key: string]: TStationData }
export type TRoutes = { [key: string]: TRoute }

export type TStationData = {
    stationId: string;
    stationName: string;
    coordinates: {
        lat: string;
        lon: string;
    }
}

export enum ERulerYlineType {
    INVISIBLE = "invisible",
    SECOND = "second",
    FIVE_MINUTES = "fiveMinutes",
    HOUR = "hour",
}

export type TRouteData = {
    segments: { [key: string]: TRouteSegment },
    segmentOrder: string[],
    stations: TStationData[]
}


export type TRulerYdata = { key: string, type: ERulerYlineType, y: number, timeString: string, timeMinutes: number }
export type TRulerXdata = TStationData & {
    key: string,
    x: number,
}
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

export type TSectionMenuItem = {
    id: string,
    mobileDisplayType: ESectionMenuDisplayType,
    label: string,
    isActive: boolean,
    action: TAction
}

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