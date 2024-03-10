import {call, take} from "redux-saga/effects";
import {Dispatch} from "@reduxjs/toolkit";
import {initSaga} from "./initSaga";
import { EActionType, actions } from "../actions";
import { timetableLoaderSaga } from "./timetableLoaderSaga";
import { EHttpMethod } from "../services/httpRequest";
import { stationInfoLoaderSaga } from "./stationInfoLoaderSaga";

export function* rootSaga(dispatch: Dispatch, rootElement: HTMLElement, i18n: any):Generator<any,void,any> {
  yield call(initSaga, dispatch, rootElement, i18n);
  while(true){
    const action = yield take([
      EActionType.REQUEST_TIMETABLE,
      EActionType.REQUEST_STATION_INFO
    ])
    switch(action.type){
      case EActionType.REQUEST_TIMETABLE:{
        const { routeId} = action.payload
        yield call(timetableLoaderSaga, EHttpMethod.POST, `test_url/${routeId}`, 'json', actions.timetableResponse);
        break;
      }
      case EActionType.REQUEST_STATION_INFO:{
        console.log("REQUEST_STATION_INFO")
        const { stationId} = action.payload
        yield call(stationInfoLoaderSaga, EHttpMethod.POST, `test_url/${stationId}`, stationId,'json', actions.stationInfoReceived);
        break;
      }

    }

  }
}
