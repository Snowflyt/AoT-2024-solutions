export const compose =
  <T, U, V, W>(f: (x: T) => U, g: (y: U) => V, h: (z: V) => W) =>
  (a: T) =>
    h(g(f(a)));

type FirstChar<S extends string> = S extends `${infer C}${string}` ? C : never;

export const upperCase = <S extends string>(x: S): Uppercase<S> => x.toUpperCase() as Uppercase<S>;
export const lowerCase = <S extends string>(x: S): Lowercase<S> => x.toLowerCase() as Lowercase<S>;
export const firstChar = <S extends string>(x: S): FirstChar<S> => x[0] as FirstChar<S>;
export const firstItem = <Head>(x: readonly [Head, ...unknown[]]): Head => x[0];
export const makeTuple = <T>(x: T): [T] => [x];
export const makeBox = <T>(value: T): { value: T } => ({ value });
