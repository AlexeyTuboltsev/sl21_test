import {call, delay, put, select} from "redux-saga/effects";
import {EHttpMethod} from "../services/httpRequest";
import {ERouteSegmentType, TInternalState, TRouteData, TRouteSegment, TStationData} from "../types";
import {stop_times} from "../test_data";
import {generateRandomString} from "../utils/utils";

export function* timetableLoaderSaga<ResponseType>(tripId: string, responseAction: any) {
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
        const internalState: TInternalState = yield select((state) => state.internal);
        const dataTransformed: TRouteData = yield call(transformTimetableData, stop_times, internalState, tripId)
        yield put(responseAction(dataTransformed))

    } catch (e) {
        console.log('error', e)
        //todo
    }
}

//dummy transform request to internal data shape
function transformTimetableData(data: string, {stations}: TInternalState, id: string): {
    segments: TRouteSegment,
    segmentOrder: string[],
    stations: TStationData[]
} {
    return data
        .split("\n")

        .reduce((acc: any, line: string) => {
            const lineSplit = line.split("\t");

            const tripId = lineSplit[0];

            if (id === tripId) {
                const segmentId = generateRandomString(3);

                const thisSegmentFrom = lineSplit[1];
                const stopId = lineSplit[3];

                let prevSegment = null;
                if (acc.segmentOrder.length !== 0) {
                    const previousSegmentId = acc.segmentOrder[acc.segmentOrder.length - 1];
                    prevSegment = acc.segments[previousSegmentId];

                    if (prevSegment !== null) {
                        // generate transfer segment to this stop
                        const transferSegmentId = generateRandomString(3);
                        acc.segments[transferSegmentId] = {
                            segmentId: transferSegmentId,
                            type: ERouteSegmentType.TRANSFER,
                            from: prevSegment.to,
                            to: thisSegmentFrom,
                            tripId,
                            fromStopId: prevSegment.stopId,
                            toStopId: stopId,
                        }
                        acc.segmentOrder.push(transferSegmentId)
                    }
                }
                acc.segments[segmentId] = {
                    segmentId,
                    tripId: lineSplit[0],
                    from: lineSplit[1],
                    to: lineSplit[2],
                    stopId,
                    type: ERouteSegmentType.STOP
                }
                acc.segmentOrder.push(segmentId)

                acc.stations.push(stations[stopId])

            }
            return acc;
        }, {segments: {}, segmentOrder: [], stations: []})
}
