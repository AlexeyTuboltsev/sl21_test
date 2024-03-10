import {BrowserHistory} from "history";
import {call, fork, put, take, spawn} from "redux-saga/effects";
import {TRoute} from "../router";
import {locationWatcherSaga} from "./locationWatcherSaga";
import {getRoute, setupHistory} from "../utils/routerUtils";
import {Dispatch} from "@reduxjs/toolkit";
import {setupResizeObserver, TResizeEventPayload} from "../services/resizeObserver";
import {langWatcherSaga} from "./langWatcherSaga";
import {ELang, initI18n} from "../services/i18n";
import {uiSaga} from "./uiSaga";
import {EProcessState} from "../types";
import {actions} from "../actions";


export function* initSaga(dispatch: Dispatch, rootElement: HTMLElement, i18n: any) {
  yield put(actions.setAppState({appState: EProcessState.IN_PROGRESS}))

  const [history, stopHistoryListener]: [BrowserHistory, () => void] = yield call(setupHistory, dispatch)
  const initialRoute: TRoute = yield call(getRoute, history.location) //todo extract location to a service for testing etc
  yield spawn(locationWatcherSaga, history, initialRoute)

  yield call(initI18n, i18n, ELang.EN)
  yield spawn(langWatcherSaga, i18n)

  const stopResizeObserver: () => void = yield call(setupResizeObserver, rootElement, dispatch)
  const screenSize: { payload: TResizeEventPayload } = yield take(actions.screenResize)
  yield spawn(uiSaga, screenSize.payload)
  yield put(actions.requestRouteChange(initialRoute))


  //TODO teardown (stopHistoryListener, stopResizeObserver, langWatcher)
}




