type Gender = "M" | "F";

type NaughtyOrNice<Item extends readonly [string, Gender, `${number}`]> =
  Item[0] extends "Yanni" | "Petra" | "Aagya" ? "nice" : "naughty";

export type FormatNames<Names extends readonly (readonly [string, Gender, `${number}`])[]> = {
  [I in keyof Names]: {
    name: Names[I][0];
    count: Names[I][2] extends `${infer N extends number}` ? N : never;
    rating: NaughtyOrNice<Names[I]>;
  };
};
