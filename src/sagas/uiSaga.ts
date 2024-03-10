import { actions, EActionType, TAction } from "../actions";
import { call, cancel, fork, put, select, take, cancelled } from "redux-saga/effects";
import { EMenuType, EProcessState, TMenuItem, TReadyAppState } from "../types";
import { findRouteGenerator } from "../routes/common/routeData";
import isEqual from "lodash.isequal";
import { Task } from "redux-saga";
import { produce } from "immer";
import { requestSaga } from "./requestSaga";
import { EHttpMethod } from "../services/httpRequest";
import { TResizeEventPayload } from "../services/resizeObserver";
import { screenSize } from "../routes/common/screenSize";
import { stat } from "fs";
import { generateRoute } from "../routes/home/home";
import { config } from "../config";

export function* uiSaga(screenSize: TResizeEventPayload) {
  let currentRouteDataGenerator: Task<any> | undefined = undefined;
  while (true) {
    const action: TAction = yield take(Object.values(actions).map(action => action.type))

    switch (action.type) {
      case "REQUEST_ROUTE_CHANGE": {
        const state: Readonly<TReadyAppState> = yield select(state => state.ui)

        const route = action.payload
        if (!isEqual(state.route, route)) {
          if (currentRouteDataGenerator !== undefined) {
            yield cancel(currentRouteDataGenerator);
          }
          const routeDataGenerator = findRouteGenerator(route)

          currentRouteDataGenerator = yield fork(routeDataGenerator as any, screenSize)
        }

        break;
      }
      case "EXTERNAL_LINK": {

      }
    }
  }
}

export type TActionMap = { [key in EActionType]?: ((state: TReadyAppState, action: any) => TReadyAppState | Generator<any, TReadyAppState, any>) }

export const screenResize: TActionMap = {
  [EActionType.SCREEN_RESIZE]: function* (state: TReadyAppState, action: ReturnType<typeof actions.screenResize>) {
    const newScreenSize = screenSize(action.payload)
    if (newScreenSize !== state.screenSize) {
      return yield put(actions.setAppState(
        produce(state, (nextState) => {
          nextState.screenSize = newScreenSize
        })
      ))
    }
  },
}





export function findStateGenerator(actionType: EActionType, actionMap: any) {
  return Object.keys(actionMap).find(key => key === actionType)
}

export function* actionListenerLoop(actionMap: TActionMap) {
  while (true) {
    const action: TAction = yield take(Object.keys(actionMap))

    const stateGeneratorKey: EActionType = yield call(findStateGenerator, action.type, actionMap)
    if (stateGeneratorKey !== undefined) {
      const state: Readonly<TReadyAppState> = yield select(state => state.ui)
      yield fork((actionMap as any)[stateGeneratorKey], state, action)
    }
  }
}
