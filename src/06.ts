export const createRoute = <Route>(author: string, route: Route): Route => {
  console.log(`[createRoute] route created by ${author} at ${Date.now()}`);
  return route;
};
