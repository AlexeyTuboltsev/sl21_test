import { call, put, delay } from "redux-saga/effects";
import { createRequest, EHttpMethod } from "../services/httpRequest";
import { AxiosResponse } from "axios";
import { TSegment, TTimetableData, TStopData } from "../types";
import { segments1, stops } from "../test_data";

export function* timetableLoaderSaga<ResponseType>(method: EHttpMethod, url: string, responseType: ResponseType, responseAction: any) {
  try {
    // const {
    //   data,
    //   status,
    //   statusText
    // }: AxiosResponse<ResponseType, any> = yield call(createRequest, method, url, 'json')

    //-- dummy request
    yield delay(1000);
    const data = {}
    const statusText = "ok"
    const status = 200
    //-- dummy request

    const dataTransformed = transformTimetableData(data)
    yield put(responseAction(dataTransformed))

  } catch (e) {
    console.log('error', e)
    //todo
  }
}

function transformTimetableData(data: any): [TSegment[], TStopData[]] {
  //dummy transform request to internal data shape
  return [segments1, stops]
}