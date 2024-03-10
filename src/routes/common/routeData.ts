import {ERoute, TRoute} from "../../router";
import {home} from "../home/home";


export function findRouteGenerator(route: TRoute): any {
  switch (route.routeName) {
    case ERoute.HOME:
      return home;
  }
}
