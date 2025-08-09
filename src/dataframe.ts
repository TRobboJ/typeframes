import { omit, pick, Prettify, Row, Slice } from "./generics";
import { Series } from "./series";

export class DataFrame<R extends Row> {
  readonly rows: R[];

  constructor(rows: R[] = []) {
    this.rows = rows.slice();
  }

  /** Get typed Series for a column */
  col<K extends keyof R>(key: K): Series<R[K], K> {
    return new Series(
      this.rows.map((row) => row[key]),
      key,
    );
  }

  /** Select subset of columns -> new DataFrame with narrowed row type */
  select<K extends keyof R>(...keys: K[]): DataFrame<Prettify<Pick<R, K>>> {
    const rows = this.rows.map((row) => pick(row, keys));
    return new DataFrame(rows);
  }

  /** Drop columns -> new DataFrame without those keys */
  drop<K extends (keyof R)[]>(
    ...keys: K
  ): DataFrame<Prettify<Omit<R, K[number]>>> {
    const rows = this.rows.map((row) => omit(row, keys));
    return new DataFrame(rows);
  }

  /** Assign new columns computed from existing row -> new type merges them in */
  assign<T extends Row>(map: {
    [K in keyof T]: (row: R) => T[K];
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

  /** Map rows -> produce a DataFrame of completely new row type S */
  mapRows<S extends Row>(fn: (row: R, i: number) => S): DataFrame<S> {
    return new DataFrame(this.rows.map(fn));
  }

  /** Filter rows -> keeps same row type R */
  filterRows(fn: (row: R, i: number) => boolean): DataFrame<R> {
    return new DataFrame(this.rows.filter(fn));
  }

  push(row: R) {
    this.rows.push(row);
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
}
