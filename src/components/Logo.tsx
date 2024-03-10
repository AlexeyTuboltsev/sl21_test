import styles from "./Logo.module.scss";
import {actions} from "../actions";
import {ERoute} from "../router";
import React, {FC} from "react";
import {useDispatch} from "react-redux";
import {ReactComponent as SL21_Logo} from "../assets/logo.svg";
import cn from 'classnames'

export const Logo: FC<{
  className: string
}> = ({className}) => {
  const dispatch = useDispatch()

  return <div
    className={cn(styles.logo, className)}
    onClick={() => dispatch(actions.requestRouteChange({routeName: ERoute.HOME}))}
  >
    <SL21_Logo/>
  </div>
}

