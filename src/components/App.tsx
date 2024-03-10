import React, {FC} from 'react';
import {useSelector} from 'react-redux'
import {EProcessState, TReadyAppState} from "../types";
import {TStore} from "../store";
import {ERoute} from "../router";
import {Home} from "../routes/home/Home";
import { StartScreen } from './StartScreen';


export const App = () => {
  const state = useSelector((store: TStore) => store.ui)
  switch (state.appState) {
    case EProcessState.NOT_STARTED:
      return <AppNotStarted/>
    case EProcessState.IN_PROGRESS:
      return <AppInProgress/>
    case EProcessState.READY:
      return <AppReady {...state} />
    case EProcessState.ERROR:
      return <AppError/>
  }
}

export const AppNotStarted = () => <StartScreen />
export const AppInProgress = () => <StartScreen />
export const AppError = () => <div>error</div>

export const AppReady: FC<TReadyAppState> = (state) => {
  switch (state.route.routeName) {
    case ERoute.HOME:
      return <Home state={state}/>;
     
  }
}
