export const createRoute = <Route extends number | string>(author: string, route: Route): Route => {
  console.log(`[createRoute] route created by ${author} at ${Date.now()}`);
  return route;
};
