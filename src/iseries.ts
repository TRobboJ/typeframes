export type SeriesLambda<SeriesType, SeriesReturnType> = (
  value: SeriesType,
  i: number,
) => SeriesReturnType;

/**
 * Series<T, N>
 *
 * Represents a typed, named collection of values (like a dataframe column).
 * Provides utilities for transformation, math/statistics, string operations,
 * and handling missing values.
 */
export interface ISeries<SeriesType, SeriesName extends PropertyKey> {
  readonly items: SeriesType[];
  readonly name: SeriesName;
  readonly size: number;

  /**
   * Return the first `n` elements of the series.
   * @param n Number of items to return (default: 1)
   */
  head(n?: number): SeriesType[] | undefined;

  /**
   * Return the last `n` elements of the series.
   * @param n Number of items to return (default: 1)
   */
  tail(n?: number): SeriesType[] | undefined;

  /**
   * Transform the series values using a mapping function.
   * @param fn Mapping function receiving (value, index)
   * @param newName Optional new name for the returned series
   */
  lambda<SeriesReturnType>(
    fn: SeriesLambda<SeriesType, SeriesReturnType>,
  ): ISeries<SeriesReturnType, SeriesName>;
  lambda<SeriesReturnType, NewSeriesName extends PropertyKey>(
    fn: SeriesLambda<SeriesType, SeriesReturnType>,
    newName: NewSeriesName,
  ): ISeries<SeriesReturnType, NewSeriesName>;

  /**
   * Append new items to the series.
   * @param newItems Items to add
   * @param newName Optional new name for the returned series
   */
  concat<R>(newItems: R[]): ISeries<SeriesType | R, SeriesName>;
  concat<R, NewSeriesName extends PropertyKey>(
    newItems: R[],
    newName: NewSeriesName,
  ): ISeries<SeriesType | R, NewSeriesName>;

  /** Return the series values as an array */
  toArray(): SeriesType[];

  /** Sum of all numeric values */
  sum(): number;

  /** Maximum numeric value, or undefined if there are no valid numbers */
  max(): number | undefined;

  /** Minimum numeric value, or undefined if there are no valid numbers */
  min(): number | undefined;

  /** Arithmetic mean of numeric values, or undefined if empty */
  mean(): number | undefined;

  /** Median of numeric values, or undefined if empty */
  median(): number | undefined;

  /**
   * Quantile of numeric values
   * @param p Position in [0,1] (0 = min, 0.5 = median, 1 = max)
   */
  quantile(p: number): number | undefined;

  /** Convert all string values to uppercase (non-strings unchanged) */
  toUpper(): ISeries<SeriesType | string, SeriesName>;

  /** Convert all string values to lowercase (non-strings unchanged) */
  toLower(): ISeries<SeriesType | string, SeriesName>;

  /**
   * Replace specific values with a fill value
   * @param fill Replacement value
   * @param find Values to replace - accepts any number of parameters
   */
  fill<FillValue, ReplacementValues extends readonly unknown[]>(
    fill: FillValue,
    ...find: ReplacementValues
  ): ISeries<
    Exclude<SeriesType, ReplacementValues[number]> | FillValue,
    SeriesName
  >;

  /** Replace nullish (null, undefined, NaN) values with the fill value */
  fillNullish<FillValue>(
    fill: FillValue,
  ): ISeries<SeriesType | FillValue, SeriesName>;

  /** Replace falsey values (null, undefined, NaN, 0, "", false) with a fill value */
  fillFalsey<FillValue>(
    fill: FillValue,
  ): ISeries<SeriesType | FillValue, SeriesName>;

  /**
   * Forward-fill missing values by propagating the last valid value.
   * @param isValid Predicate to determine valid values (default: truthy)
   * Note: The return type still may contain falsey values as there is no guarantee the first value is not falsey.
   */
  forwardFill(
    isValid?: (value: SeriesType) => boolean,
  ): ISeries<SeriesType, SeriesName>;

  /**
   * Backward-fill missing values by propagating the next valid value.
   * @param isValid Predicate to determine valid values (default: truthy)
   * Note: The return type still may contain falsey values as there is no guarantee the last value is not falsey.
   */
  backwardFill(
    isValid?: (value: SeriesType) => boolean,
  ): ISeries<SeriesType, SeriesName>;
}
