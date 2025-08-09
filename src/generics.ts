import { Row } from "./idataframe";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Entries<T extends object> = [[keyof T], T[keyof T]];

export const getObjectEntries = <T extends Row>(
  obj: T,
): Prettify<Entries<T>> => {
  return Object.entries(obj) as Entries<T>;
};

type FromEntries<T extends ReadonlyArray<readonly [PropertyKey, unknown]>> = {
  [E in T[number] as E[0]]: E[1];
};

export const getObjectFromEntries = <
  const T extends ReadonlyArray<readonly [PropertyKey, unknown]>,
>(
  entries: T,
): Prettify<FromEntries<T>> => {
  return Object.fromEntries(entries) as FromEntries<T>;
};

export const omit = <T extends Row, K extends (keyof T)[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K[number])),
  ) as Omit<T, K[number]>;
};

export const pick = <T extends Row, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as K)),
  ) as Pick<T, K>;
};
