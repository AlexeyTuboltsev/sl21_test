import {routeDefs, TNavigationRoute} from "../router";
import {BrowserHistory} from "history";
import {call, select, take} from "redux-saga/effects";
import {PayloadAction} from "@reduxjs/toolkit";
import {setLocation} from "../utils/routerUtils";
import isEqual from 'lodash.isequal';
import {TReadyAppState} from "../types";
import {actions} from "../actions";


export function* locationWatcherSaga(history: BrowserHistory, initialRoute: TNavigationRoute) {

  yield call(setLocation, history, routeDefs, initialRoute)
  while (true) {
    // const cancel = yield take() // TODO teardown
    const oldRoute: TNavigationRoute = yield select(state => state.ui.route)
    const action: PayloadAction<TReadyAppState> | PayloadAction<string> = yield take([actions.setAppState.type,actions.externalLink.type])

    if(action.type === actions.setAppState.type){
      const newRoute: TNavigationRoute = yield select(state => state.ui.route)

      if (!isEqual(newRoute, oldRoute)) {
        yield call(setLocation, history, routeDefs, newRoute)
      }
    }

    if(action.type === actions.externalLink.type){
      const link = action.payload as string
      history.push(link)
    }
  }
}