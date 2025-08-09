import { omit, pick, type Prettify } from "./generics";
import type { Row, IDataFrame, Slice, FunctionMap } from "./idataframe";
import { Series } from "./series";

export class DataFrame<R extends Row> implements IDataFrame<R> {
  readonly rows: R[];

  constructor(rows: R[] = []) {
    this.rows = rows.slice();
  }

  col<K extends keyof R>(key: K): Series<R[K], K> {
    return new Series(
      this.rows.map((row) => row[key]),
      key,
    );
  }

  select<K extends keyof R>(...keys: K[]): DataFrame<Prettify<Pick<R, K>>> {
    const rows = this.rows.map((row) => pick(row, keys));
    return new DataFrame(rows);
  }

  drop<K extends (keyof R)[]>(
    ...keys: K
  ): DataFrame<Prettify<Omit<R, K[number]>>> {
    const rows = this.rows.map((row) => omit(row, keys));
    return new DataFrame(rows);
  }

  assign<T extends Row>(map: {
    [K in keyof T]: FunctionMap<R, T[K]>;
  }): DataFrame<Prettify<R & T>> {
    const newKeys = Object.keys(map) as (keyof T)[];
    const rows = this.rows.map((r) => {
      const add: Row = {};
      for (const k of newKeys) {
        add[k as string] = (map[k] as (row: R) => unknown)(r);
      }
      return { ...r, ...add } as R & T;
    });
    return new DataFrame(rows);
  }

  iloc(indices: number | number[] | Slice): DataFrame<R> {
    let selectedRows: R[] = [];

    if (typeof indices === "number") {
      // Single row index
      const i = indices;
      if (i < 0 || i >= this.rows.length) {
        throw new RangeError(`Index ${i} out of bounds`);
      }
      selectedRows = [this.rows[i]];
    } else if (Array.isArray(indices)) {
      // Array of indices
      selectedRows = indices.map((i) => {
        if (i < 0 || i >= this.rows.length) {
          throw new RangeError(`Index ${i} out of bounds`);
        }
        return this.rows[i];
      });
    } else {
      // Slice object
      const start = indices.start ?? 0;
      const end = indices.end ?? this.rows.length;
      const step = indices.step ?? 1;

      if (start < 0 || end > this.rows.length || step <= 0) {
        throw new RangeError(`Invalid slice parameters`);
      }

      for (let i = start; i < end; i += step) {
        selectedRows.push(this.rows[i]);
      }
    }

    return new DataFrame(selectedRows);
  }

  mapRows<S extends Row>(fn: FunctionMap<R, S>): DataFrame<S> {
    return new DataFrame(this.rows.map(fn));
  }

  filterRows(fn: FunctionMap<R, boolean>): DataFrame<R> {
    return new DataFrame(this.rows.filter(fn));
  }

  pushRow(row: R) {
    this.rows.push(row);
  }

  addColumn<K extends PropertyKey, T>(
    key: K,
    fill?: T | FunctionMap<R, T>,
  ): DataFrame<
    Prettify<
      R & {
        [P in K]: T;
      }
    >
  > {
    return new DataFrame(
      this.rows.map((row, i) => ({
        ...row,
        [key]:
          typeof fill === "function"
            ? (fill as FunctionMap<R, T>)(row, i)
            : fill,
      })),
    ) as DataFrame<
      Prettify<
        R & {
          [P in K]: T;
        }
      >
    >;
  }

  join<
    OtherRow extends Row,
    Key extends keyof R,
    OtherKey extends keyof OtherRow,
    JoinType extends "left" | "right",
  >(
    otherDf: DataFrame<OtherRow>,
    type: JoinType,
    on: {
      thisKey: Key;
      otherKey: OtherKey;
    },
  ) {
    // This is also gross will update it later
    type ResultRow = JoinType extends "left"
      ? Prettify<
          R & { [P in Exclude<keyof OtherRow, OtherKey>]: OtherRow[P] | null }
        >
      : JoinType extends "right"
        ? Prettify<
            OtherRow & {
              [P in Exclude<keyof R, Key>]: R[P] | null;
            }
          >
        : never;

    // Switch sides for right or left join
    // I know it's gross I will change it later
    const left = type === "left" ? on.thisKey : on.otherKey;
    const right = type === "left" ? on.otherKey : on.thisKey;
    const leftDf = type === "left" ? this : otherDf;
    const rightDf = type === "left" ? otherDf : this;

    const map = new Map<OtherRow[OtherKey], OtherRow[]>();
    for (const row of rightDf.rows) {
      const keyValue = row[right];
      if (!map.has(keyValue)) {
        map.set(keyValue, []);
      }
      map.get(keyValue)!.push(row);
    }

    const joinedRows: ResultRow[] = leftDf.rows.map((leftRow) => {
      const matches = map.get(leftRow[left]) ?? [];
      if (matches.length === 0) {
        const nulls = Object.fromEntries(
          Object.keys(rightDf.rows[0] ?? {})
            .filter((k) => k !== right)
            .map((k) => [k, null]),
        ) as { [P in Exclude<keyof OtherRow, OtherKey>]: null };

        return { ...leftRow, ...nulls };
      }

      // NOTE: This doesn't handle multiple matches and only returns the first
      const rightWithoutKey = Object.fromEntries(
        Object.entries(matches[0]).filter(([k]) => k !== right),
      ) as { [P in Exclude<keyof OtherRow, OtherKey>]: OtherRow[P] };

      return { ...leftRow, ...rightWithoutKey };
    });

    return new DataFrame(joinedRows);
  }

  toArray(): R[] {
    return this.rows.slice();
  }

  head(n = 5): R[] {
    return this.rows.slice(0, n);
  }

  get shape(): [number, number] {
    const cols = this.rows.length ? Object.keys(this.rows[0]).length : 0;
    return [this.rows.length, cols];
  }

  get columns(): (keyof R)[] {
    if (!this.shape[1]) return [];
    return Object.keys(this.rows[0]);
  }
}
