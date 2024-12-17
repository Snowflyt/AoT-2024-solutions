export type Excuse<Excuse extends Record<PropertyKey, string>> = {
  new (excuses: Excuse): `${keyof Excuse & string}: ${Excuse[keyof Excuse]}`;
};
