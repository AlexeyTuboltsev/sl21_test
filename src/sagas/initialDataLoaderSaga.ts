import {delay, put} from "redux-saga/effects";
import {EHttpMethod} from "../services/httpRequest";
import {TRoute, TRoutes, TStationData} from "../types";
import {routes, stations} from "../test_data";

export function* initialDataLoaderSaga<ResponseType>(method: EHttpMethod, url: string, responseType: ResponseType, responseAction: any) {
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
        const stationsParsed = parseStations(stations)
        const routesParsed = parseRoutes(routes)

        yield put(responseAction({
            stations: stationsParsed,
            routes: routesParsed,
        }))

    } catch (e) {
        console.log('error', e)
        //todo
    }
}

function parseStations(data: string) {
    return data.split("\n").reduce((acc: { [key: string]: TStationData }, line) => {
        const lineSplit = line.replace(/\t+/, "\t").split("\t")

        const stationData = {
            stationId: lineSplit[0],
            stationName: lineSplit[1],
            coordinates: {
                lat: lineSplit[3],
                lon: lineSplit[4]
            }
        }

        acc[stationData.stationId] = stationData
        return acc
    }, {})
}

function parseRoutes(data:string){
    return data
        .split("\n")
        .reduce((acc:TRoutes, line) => {
            const lineSplit = line.replace(/\t+/, "\t").split("\t")

            const routeData = {
                routeId: lineSplit[0],
                routeName: lineSplit[2]
            }
            acc[routeData.routeId] = routeData
            return acc
        },{})
}
