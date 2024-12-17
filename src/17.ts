export const compose = (f, g, h) => (a) => h(g(f(a)));

export const upperCase = (x) => x.toUpperCase();
export const lowerCase = (x) => x.toLowerCase();
export const firstChar = (x) => x[0];
export const firstItem = (x) => x[0];
export const makeTuple = (x) => [x];
export const makeBox = (value) => ({ value });
