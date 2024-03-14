import React, {FC, useMemo, useRef} from 'react'
import styles from "../../components/App.module.scss";
import {
  EModalState,
  EProcessState,
  ERulerYlineType,
  TReadyAppState,
  TRulerXdata,
  TRulerYdata,
  TTimetableData
} from "../../types";
import cn from 'classnames';
import {useDispatch} from 'react-redux';
import {actions} from '../../actions';


export const Home: FC<{ state: TReadyAppState }> = ({ state }) => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);

  return <div className={styles.mainWrapper}>

    <div className={styles.header}>
      <div className={styles.routeSelector}>
        <select
            onChange={(e) => dispatch(actions.requestTimetable({routeId: e.target.value}))}
            value={state.routeSelector.value}
        >{
          state.routeSelector.options.map(route => <option key={route.id} value={route.id}>{route.label}</option>)
        }</select>
      </div>
    </div>
    <div className={styles.content}>
      <div ref={ref} className={styles.timetableWrapper}>
        <TimetableStates state={state}/>
      </div>
      <Modal {...state.modalState} />
    </div>
  </div>
}

const TimetableStates: FC<{ state: TReadyAppState }> = ({state}) => {
  switch (state.timetableState.state) { // :D
    case EProcessState.NOT_STARTED:
    case EProcessState.IN_PROGRESS:
      return <div>loading ...</div>
    case EProcessState.ERROR:
      return <div>error...</div>
    case EProcessState.READY:
      return <Timetable {...state.timetableState.data} />
  }
}

const Modal: FC<any> = ({ state, data }) => { //fixme: any
  const dispatch = useDispatch();

  return <div className={cn(styles.modal, { [styles.visible]: state === EModalState.MODAL_OPEN })}>
    <span onClick={() => dispatch(actions.closeModal())} className={styles.modalCloseButton}>x</span>
    <ModalContent {...data} /> 
  </div>
}

const ModalContent: FC<any> = (props) => {
  switch (props.state) {
    case EProcessState.ERROR:
      return <div className={styles.modalContent}>error</div>
    case EProcessState.READY:
      return <div className={styles.modalContent}>
        <div>{props.name}</div>
        <br/>
        {props.id && <div><span>id: </span><span>{props.id}</span></div>}

        {props.coordinates && <div>coordinates:</div>}
        {props.coordinates?.lat && <div><span>lat: </span><span>{props.coordinates.lat} </span> </div>}
        {props.coordinates?.lon && <div><span>lon: </span><span>{props.coordinates.lon} </span></div>}
      </div>
      case EProcessState.IN_PROGRESS:
        return <div className={styles.modalContent}>loading...</div>
    case EProcessState.NOT_STARTED:
      default:
      return null
  }
}

const Timetable: FC<TTimetableData> = ({
  contentWidth,
  contentHeight,
  routeParts,
  rulerWidth,
  timetableHeight,
  timetableWidth,
  zoomX,
  zoomY,
  zoomedPositionX,
  zoomedPositionY,
  rulerYdata,
  rulerXdata,
  moveX,
  moveY
}) => {
  const dispatch = useDispatch();

  return <svg
    className={styles.svgBase}
    width={contentWidth}
    height={contentHeight}
    preserveAspectRatio="xMidYMid meet"
    viewBox={`-${rulerWidth} -${rulerWidth} ${contentWidth} ${contentHeight}`}
  >
    <svg
      x="0"
      y="0"
      width={timetableWidth}
      height={timetableHeight}
      preserveAspectRatio="none"
      viewBox={` 0 0 ${timetableWidth / zoomX} ${timetableHeight / zoomY}`}
    >
      <g transform={`translate(${zoomedPositionX} ${zoomedPositionY})`}>
        <rect
          onMouseDown={(e) => dispatch(actions.timetablePointerDown({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })) }
          onMouseUp={(e) => dispatch(actions.timetablePointerUp({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }))}
          onMouseOut={(e) => dispatch(actions.timetablePointerUp({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }))}
          onMouseLeave={(e) => dispatch(actions.timetablePointerUp({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }))}
          onMouseMove={(e) => dispatch(actions.timetablePointerMove({ x: e.movementX, y: e.nativeEvent.movementY }))}
          className={styles.timetable} width={timetableWidth} height={timetableHeight}
        />
        {rulerXdata.map((stationTrack, i) => {
          return <line
            key={stationTrack.key}
            className={styles.stationTrack}
            x1={stationTrack.x}
            y1={0}
            x2={stationTrack.x}
            y2={timetableHeight}
          />
        })}
        {routeParts
          .map((routePart, j) => {
            return <g key={routePart.segmentId} >
              <line
                onClick={() => dispatch(actions.showTransferInfo({segmentId:routePart.segmentId}))}
                className={styles.route}
                x1={routePart.segmentCoordinates.from.x}
                y1={routePart.segmentCoordinates.from.y}
                x2={routePart.segmentCoordinates.to.x}
                y2={routePart.segmentCoordinates.to.y}
              />
            </g>
          })}
      </g>
    </svg>
    <rect className={styles.rulerCenter} x={-rulerWidth} y={-rulerWidth} height={rulerWidth} width={rulerWidth} />
    <RulerX contentWidth={contentWidth} rulerWidth={rulerWidth} rulerData={rulerXdata} zoomedPositionX={zoomedPositionX} zoomX={zoomX} />
    <RulerY contentHeight={contentHeight} rulerWidth={rulerWidth} rulerData={rulerYdata} zoomedPositionY={zoomedPositionY} zoomY={zoomY} />


  </svg>
}

const RulerX: FC<{ rulerWidth: number, contentWidth: number, rulerData: TRulerXdata[], zoomedPositionX: number, zoomX: number }> = ({
  zoomX,
  zoomedPositionX,
  rulerWidth,
  contentWidth,
  rulerData
}) => {
  const dispatch = useDispatch();
  const refX = useRef<SVGRectElement>(null);
  const rulerLength = useMemo(() => contentWidth - rulerWidth, [contentWidth, rulerWidth])

  return <svg
    x="0"
    y={-rulerWidth}
    width={rulerLength}
    height={rulerWidth}
    preserveAspectRatio="none"
    viewBox={` 0 0 ${(rulerLength) / zoomX} ${rulerWidth}`}
  >
    <g transform={`translate(${zoomedPositionX} 0)`}>
      <rect ref={refX} className={styles.rulerX} x={0} y={0} height={rulerWidth} width={rulerLength}
        onPointerDown={(e) => {
          dispatch(actions.pointerXdown({ start: e.nativeEvent.offsetX }))
          lockPointer(refX.current, e.pointerId)
        }
        }
        onPointerUp={(e) => {
          dispatch(actions.pointerUp({ startX: e.clientX, startY: e.clientY }))
          unlockPointer(refX.current, e.pointerId)
        }
        }
        onPointerMove={(e) => {
          dispatch(actions.zoomX({ moveX: e.movementY }))
        }
        }
        onPointerLeave={(e) => {
          dispatch(actions.pointerUp({ startX: e.clientX, startY: e.clientY }))
          unlockPointer(refX.current, e.pointerId)
        }
        }
      />
      {
        rulerData.map(station => {
          return <g key={station.key} >
            <line key={station.key} className={styles.rulerXStationMarker} x1={station.x} y1={40} x2={station.x} y2={50} />
            <svg
              x={station.x}
              y={10}
              width={150} height={30}
              viewBox='0 -20 150 30' preserveAspectRatio='xMidYMid meet'>
              <text transform={`scale(${1 / zoomX} 1) `}
                onClick={(e) => dispatch(actions.showStationInfo({ stationId: station.stationId }))}
                className={styles.rulerXStationName} x={0} y={0}
              >
                {station.stationName}
              </text>
              {/* <rect className={styles.rulerXStationNameContainer} x=/> */}
            </svg>
          </g>
        })
      }
    </g>
  </svg>
}


const RulerY: FC<{ rulerWidth: number, contentHeight: number, rulerData: TRulerYdata[], zoomedPositionY: number, zoomY: number }> = ({ rulerWidth, contentHeight, rulerData, zoomedPositionY, zoomY }) => {
  const refY = useRef<SVGRectElement>(null);
  const dispatch = useDispatch();
  const rulerHeight = useMemo(() => contentHeight - rulerWidth, [contentHeight, rulerWidth])

  return <svg
    x="-50"
    y={0}
    width={rulerWidth}
    height={rulerHeight}
    preserveAspectRatio="none"
    viewBox={` -50 0 ${(rulerWidth)} ${(rulerHeight) / zoomY}`}
  >
    <g transform={`translate(0 ${zoomedPositionY})`}>
      <rect ref={refY} className={styles.rulerY} x={-rulerWidth} y={0} height={rulerHeight} width={rulerWidth}
        onPointerDown={(e) => {
          dispatch(actions.pointerYdown({ start: e.nativeEvent.offsetY }))
          lockPointer(refY.current, e.pointerId)
        }
        }
        onPointerUp={(e) => {
          dispatch(actions.pointerUp({ startX: e.clientX, startY: e.clientY }))
          unlockPointer(refY.current, e.pointerId)
        }
        }
        onPointerMove={(e) => {
          dispatch(actions.zoomY({ moveY: e.movementX }))
        }
        }
        onPointerLeave={(e) => {
          dispatch(actions.pointerUp({ startX: e.clientX, startY: e.clientY }))
          unlockPointer(refY.current, e.pointerId)
        }
        }
      />
      {rulerData.map((rulerLine) => {
        switch (rulerLine.type) {
          case ERulerYlineType.INVISIBLE:
            return <line key={rulerLine.key} className={styles.rulerLineInvisible} x1={-40} y1={rulerLine.y} x2={0} y2={rulerLine.y} />
          case ERulerYlineType.HOUR:
            return <line key={rulerLine.key} className={styles.rulerLineHour} x1={-40} y1={rulerLine.y} x2={0} y2={rulerLine.y} />
          case ERulerYlineType.FIVE_MINUTES:
            return <line key={rulerLine.key} className={styles.rulerLineMinute} x1={-30} y1={rulerLine.y} x2={0} y2={rulerLine.y} />
          case ERulerYlineType.SECOND:
            return <line key={rulerLine.key} className={styles.rulerLineSecond} x1={-10} y1={rulerLine.y} x2={0} y2={rulerLine.y} />

        }
      })
      }
    </g>
  </svg>
}

function lockPointer(element: SVGRectElement | null, pointerId: number) {
  if (element !== null) {
    element.setPointerCapture(pointerId)
  }
}

function unlockPointer(element: SVGRectElement | null, pointerId: number) {
  if (element !== null && Number.isInteger(pointerId)) {
    element.releasePointerCapture(pointerId)
  }
}