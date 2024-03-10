import { configureStore, createReducer, createSlice, getDefaultMiddleware, PayloadAction } from '@reduxjs/toolkit'
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./sagas/rootSaga";
import { EProcessState, TAppState } from "./types";
import { actions } from './actions';
export type TStore = ReturnType<typeof store.getState>

let sagaMiddleware = createSagaMiddleware();
const middleware = [...getDefaultMiddleware({ thunk: false }), sagaMiddleware];

const ui = createReducer({

  appState: EProcessState.NOT_STARTED
} as TAppState,
  {
    [actions.setAppState.type]: (state, action: PayloadAction<TAppState>) => {
      return action.payload
    },

    [actions.pointerYdown.type]: (state, action: PayloadAction<{ start: number }>) => {
      if (state.appState === EProcessState.READY) {
        const newState = state
        return { ...newState, pointerState: { pointerYdown: action.payload.start } }
      } else {
        return state
      }
    },
    [actions.pointerUp.type]: (state, action: PayloadAction<{ start: number }>) => {
      if (state.appState === EProcessState.READY && state.pointerState !== null) {
        const newState = state
        return { ...newState, pointerState: null }
      } else {
        return state
      }
    }
  }
)

const store = configureStore({
  devTools: true,
  middleware,
  reducer: {ui}
})

export function initStore(rootElement: HTMLElement, i18n: any) {
  sagaMiddleware.run(rootSaga, store.dispatch, rootElement, i18n);
  return store
}


// export const { setAppState } = ui