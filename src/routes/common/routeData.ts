import {ERoute, TNavigationRoute} from "../../router";
import {home} from "../home/home";


export function findRouteGenerator(route: TNavigationRoute): any {
  switch (route.routeName) {
    case ERoute.HOME:
      return home;
  }
}
