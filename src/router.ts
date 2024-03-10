
export enum ERoute {
  HOME = "home",
  }

export type TRouteDef = {
  routeName: ERoute,
  routePattern: string,
  paramsParser?: ((params:{[key:string]:any}) => {[key:string]:string} | null) //todo
}

export type TRoute =
  | ({ routeName: ERoute.HOME } )

export const routeDefs:TRouteDef[] = [
  {routeName: ERoute.HOME, routePattern: '/'},

  // {
  //   routeName: ERoute.ROUTE_TREE, routePattern: '/asd/:id', paramsParser: (params: {[key:string]:any}) => {
  //     if (params.id && typeof params.id === 'string') {
  //       return {id: params.id} as {id: string}
  //     } else {
  //       return null
  //     }
  //   }
  // }
]

