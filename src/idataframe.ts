import type { DataFrame } from "./dataframe";
import type { Prettify } from "./generics";
import type { Series } from "./series";

export type Row = Record<string, unknown>;
export type Slice = { start?: number; end?: number; step?: number };
export type FunctionMap<R extends Row, T> = (row: R, i: number) => T;

/**
 * Represents a two-dimensional, tabular data structure similar to a spreadsheet or SQL table.
 *
 * @template R - The row type where each key is a column name and each value is the column's type.
 */
export interface IDataFrame<R extends Row> {
  /** The rows contained in the DataFrame. */
  readonly rows: R[];

  /**
   * Returns a {@link Series} containing all values from a single column of the DataFrame.
   *
   * @template K - The column name key type from the DataFrame's row type `R`.
   * @param {K} key - The name of the column to extract.
   * @returns {Series<R[K], K>} A new Series containing the values from the specified column.
   *
   * @example
   * const df = new DataFrame([
   *   { name: "Alice", age: 30 },
   *   { name: "Bob", age: 25 }
   * ]);
   * const ageSeries = df.col("age");
   * console.log(ageSeries.toArray()); // [30, 25]
   */
  col<K extends keyof R>(key: K): Series<R[K], K>;

  /**
   * Returns a new {@link DataFrame} containing only the specified columns.
   *
   * @template K - The keys of the columns to select from each row in the DataFrame.
   * @param {...K[]} keys - One or more column names to include in the new DataFrame.
   * @returns {DataFrame<Prettify<Pick<R, K>>>} A new DataFrame containing only the selected columns.
   *
   * @example
   * const df = new DataFrame([
   *   { name: "Alice", age: 30, active: true },
   *   { name: "Bob", age: 25, active: false }
   * ]);
   * const selected = df.select("name", "active");
   * console.log(selected.toArray());
   * // [
   * //   { name: "Alice", active: true },
   * //   { name: "Bob", active: false }
   * // ]
   */
  select<K extends keyof R>(...keys: K[]): DataFrame<Prettify<Pick<R, K>>>;

  /**
   * Returns a new {@link DataFrame} with the specified columns removed.
   *
   * @template K - The keys of the columns to remove.
   * @param keys - Column names to remove.
   */
  drop<K extends (keyof R)[]>(
    ...keys: K
  ): DataFrame<Prettify<Omit<R, K[number]>>>;

  /**
   * Returns a new {@link DataFrame} with additional or replaced columns,
   * computed from existing rows.
   *
   * @template T - The new or updated columns to add.
   * @param map - An object mapping new column names to functions computing their values.
   */
  assign<T extends Row>(map: { [K in keyof T]: (row: R) => T[K] }): DataFrame<
    Prettify<R & T>
  >;

  /**
   * Selects rows by index or slice.
   *
   * @param indices - A row index, an array of indices, or a slice object.
   */
  iloc(indices: number | number[] | Slice): DataFrame<R>;

  /**
   * Maps each row to a new row, producing a new DataFrame.
   *
   * @template S - The type of the new row.
   * @param fn - Function that maps a row and its index to a new row.
   */
  mapRows<S extends Row>(fn: (row: R, i: number) => S): DataFrame<S>;

  /**
   * Filters rows based on a predicate function.
   *
   * @param fn - Function that determines whether a row should be included.
   */
  filterRows(fn: (row: R, i: number) => boolean): DataFrame<R>;

  /**
   * Appends a row to the DataFrame.
   * @param row - The row to add.
   */
  pushRow(row: R): void;

  addColumn<K extends PropertyKey, T>(
    key: K,
    fill?: T | FunctionMap<R, T>,
  ): DataFrame<
    Prettify<
      R & {
        [P in K]: T;
      }
    >
  >;

  /**
   * Returns a shallow copy of the DataFrame's rows as an array.
   */
  toArray(): R[];

  /**
   * Returns the first `n` rows of the DataFrame.
   * @param n - Number of rows to return. Defaults to 5.
   */
  head(n?: number): R[];

  /**
   * Returns the shape of the DataFrame as `[rows, columns]`.
   */
  readonly shape: [number, number];

  /**
   * Returns the DataFrame keys.
   */
  readonly columns: (keyof R)[];
}
