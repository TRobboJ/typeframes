import { omit, pick, type Prettify } from "./generics";
import type { Row, IDataFrame, Slice, RowMap, ColumnMap } from "./idataframe";
import { Series } from "./series";

export class DataFrame<R extends Row> implements IDataFrame<R> {
  readonly rows: R[];

  constructor(rows: R[] = []) {
    this.rows = [...rows];
  }

  col<K extends keyof R>(key: K): Series<R[K], K> {
    return new Series(
      this.rows.map((row) => row[key]),
      key,
    );
  }

  select<K extends keyof R>(...keys: K[]): DataFrame<Prettify<Pick<R, K>>> {
    return new DataFrame(this.rows.map((row) => pick(row, keys)));
  }

  drop<K extends keyof R>(...keys: K[]): DataFrame<Prettify<Omit<R, K>>> {
    const currentKeys = this.columns;
    const omitMap = new Set(keys);
    return new DataFrame(
      this.rows.map((row) => omit(row, currentKeys, omitMap)),
    );
  }

  assign<T extends Row>(map: {
    [K in keyof T]: RowMap<R, T[K]>;
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
    if (this.isEmpty) throw new Error(`DataFrame is empty`);
    let selectedRows: R[] = [];

    if (typeof indices === "number") {
      const i = indices;
      if (i < 0 || i >= this.rows.length) {
        throw new RangeError(`Index ${i} out of bounds`);
      }
      selectedRows = [this.rows[i]];
    } else if (Array.isArray(indices)) {
      selectedRows = indices.map((i) => {
        if (i < 0 || i >= this.rows.length) {
          throw new RangeError(`Index ${i} out of bounds`);
        }
        return this.rows[i];
      });
    } else {
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

  mapRows<S extends Row>(fn: RowMap<R, S>): DataFrame<S> {
    return new DataFrame(this.rows.map(fn));
  }

  mapColumns<S extends Row>(fnMap: ColumnMap<R, S>): DataFrame<S> {
    const seriesMap = {} as { [K in keyof S]: Series<S[K], K> };

    for (const key in fnMap) {
      seriesMap[key] = fnMap[key](this.col(key));
    }

    const length = this.rows.length;
    const newRows: S[] = [];

    for (let i = 0; i < length; i++) {
      const row = {} as S;
      for (const key in seriesMap) {
        row[key] = seriesMap[key].toArray()[i];
      }
      newRows.push(row);
    }

    return new DataFrame(newRows);
  }

  filterRows(fn: RowMap<R, boolean>): DataFrame<R> {
    return new DataFrame(this.rows.filter(fn));
  }

  pushRow(row: R) {
    this.rows.push(row);
  }

  addColumn<K extends PropertyKey, T>(
    key: K,
    fill?: T | RowMap<R, T>,
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
          typeof fill === "function" ? (fill as RowMap<R, T>)(row, i) : fill,
      })),
    ) as DataFrame<
      Prettify<
        R & {
          [P in K]: T;
        }
      >
    >;
  }

  leftJoin<
    OtherRow extends Row,
    Key extends keyof R,
    OtherKey extends keyof OtherRow,
  >(
    otherDf: DataFrame<OtherRow>,
    on: {
      thisKey: Key;
      otherKey: OtherKey;
    },
  ): DataFrame<
    Prettify<
      R & { [P in Exclude<keyof OtherRow, OtherKey>]: OtherRow[P] | null }
    >
  > {
    const map = new Map<OtherRow[OtherKey], OtherRow[]>();

    for (const row of otherDf.rows) {
      const keyValue = row[on.otherKey];
      if (!map.has(keyValue)) {
        map.set(keyValue, []);
      }
      map.get(keyValue)?.push(row);
    }

    // @ts-expect-error it's getting a bit whack in here
    const joinedRows: Prettify<
      R & { [P in Exclude<keyof OtherRow, OtherKey>]: OtherRow[P] | null }
    >[] = this.rows.map((leftRow) => {
      // @ts-expect-error We need to check the map with our other set of keys so of course the types don't match
      const matches = map.get(leftRow[on.thisKey]);
      if (!matches?.length) {
        const nulls = Object.fromEntries(
          otherDf.columns
            .filter((k) => k !== on.otherKey)
            .map((k) => [k, null]),
        );

        return { ...leftRow, ...nulls };
      }

      // NOTE: This doesn't handle multiple matches and only returns the first
      const rightWithoutKey = Object.fromEntries(
        Object.entries(matches[0]).filter(([k]) => k !== on.otherKey),
      );

      return { ...leftRow, ...rightWithoutKey };
    });
    return new DataFrame(joinedRows);
  }

  rightJoin<
    OtherRow extends Row,
    Key extends keyof R,
    OtherKey extends keyof OtherRow,
  >(
    otherDf: DataFrame<OtherRow>,
    on: {
      thisKey: Key;
      otherKey: OtherKey;
    },
  ): DataFrame<
    Prettify<
      OtherRow & {
        [P in Exclude<keyof R, Key>]: R[P] | null;
      }
    >
  > {
    const map = new Map<R[keyof R], R[]>();

    for (const row of this.rows) {
      const keyValue = row[on.thisKey];
      if (!map.has(keyValue)) {
        map.set(keyValue, []);
      }
      map.get(keyValue)?.push(row);
    }

    // @ts-expect-error it's getting a bit whack in here
    const joinedRows: Prettify<
      OtherRow & {
        [P in Exclude<keyof R, Key>]: R[P] | null;
      }
    >[] = otherDf.rows.map((rightRow) => {
      // @ts-expect-error We need to check the map with our other set of keys so of course the types don't match
      const matches = map.get(rightRow[on.otherKey]);
      if (!matches?.length) {
        const nulls = Object.fromEntries(
          this.columns.filter((k) => k !== on.thisKey).map((k) => [k, null]),
        );

        return { ...rightRow, ...nulls };
      }

      // NOTE: This doesn't handle multiple matches and only returns the first
      const rightWithoutKey = Object.fromEntries(
        Object.entries(matches[0]).filter(([k]) => k !== on.thisKey),
      );

      return { ...rightRow, ...rightWithoutKey };
    });
    return new DataFrame(joinedRows);
  }

  toArray(): R[] {
    return [...this.rows];
  }

  head(n = 5): R[] {
    return this.rows.slice(0, n);
  }

  get isEmpty(): boolean {
    return !this.shape[0];
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
