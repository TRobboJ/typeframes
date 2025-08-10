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

export const omit = <T extends Row, K extends keyof T, O extends K>(
  obj: T,
  currentKeys: K[],
  omitMap: Set<O>,
): Omit<T, O> => {
  const newObj = {} as Omit<T, O>;
  for (const key of currentKeys) {
    // @ts-expect-error We are purposely checking against this for values we can omit
    if (omitMap.has(key)) continue;
    // @ts-expect-error If we get this far we know we can assign the value
    newObj[key] = obj[key];
  }
  return newObj;
};

export const pick = <T extends Row, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> => {
  const newObj = {} as Pick<T, K>;
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
};
