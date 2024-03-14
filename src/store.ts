import {configureStore, createReducer, getDefaultMiddleware, PayloadAction} from '@reduxjs/toolkit'
import createSagaMiddleware from "redux-saga";
import {rootSaga} from "./sagas/rootSaga";
import {EProcessState, TAppState, TInternalState} from "./types";
import {actions} from './actions';

export type TStore = ReturnType<typeof store.getState>

let sagaMiddleware = createSagaMiddleware();
const middleware = [...getDefaultMiddleware({thunk: false}), sagaMiddleware];

const ui = createReducer<TAppState>({
        appState: EProcessState.NOT_STARTED
    },
    {
        [actions.setAppState.type]: (state, action: ReturnType<typeof actions.setAppState>) => {
            return action.payload
        },
        [actions.pointerYdown.type]: (state, action: PayloadAction<{ start: number }>) => {
            if (state.appState === EProcessState.READY) {
                return {...state, pointerState: {pointerYdown: action.payload.start}}
            } else {
                return state
            }
        },
        [actions.pointerUp.type]: (state, action: PayloadAction<{ start: number }>) => {
            if (state.appState === EProcessState.READY && state.pointerState !== null) {
                return {...state, pointerState: null}
            } else {
                return state
            }
        }
    }
)

const internal = createReducer<TInternalState | {}>({}, {
    [actions.initialDataLoaded.type]: (_state, action: ReturnType<typeof actions.initialDataLoaded>) => {
        return action.payload
    },
})

const store = configureStore({
    devTools: true,
    middleware,
    reducer: {ui, internal}
})

export function initStore(rootElement: HTMLElement, i18n: any) {
    sagaMiddleware.run(rootSaga, store.dispatch, rootElement, i18n);
    return store
}


// export const { setAppState } = ui