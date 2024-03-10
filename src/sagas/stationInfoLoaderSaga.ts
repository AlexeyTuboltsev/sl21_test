import { call, put, delay } from "redux-saga/effects";
import { createRequest, EHttpMethod } from "../services/httpRequest";
import { AxiosResponse } from "axios";
import { TSegment, TTimetableData, TStopData } from "../types";
import { segments, stops } from "../test_data";

export function* stationInfoLoaderSaga<ResponseType>(method: EHttpMethod, url: string, stationId:string,responseType: ResponseType, responseAction: any) {
  try {
    // const {
    //   data,
    //   status,
    //   statusText
    // }: AxiosResponse<ResponseType, any> = yield call(createRequest, method, url, 'json')

    //-- dummy request
    yield delay(1000);
    const data = stops.find(stop => stop.id === stationId)
    
    const statusText = "ok"
    const status = 200
    //-- dummy request

    yield put(responseAction(data))

  } catch (e) {
    console.log('error', e)
    //todo
  }
}
