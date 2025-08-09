import { Series } from "../src/series";

type DataframeItem<T> = { [K: string]: T };
type DataframeItems<T> = Record<string, T[]>;
type DataframeSeries<T> = { [K: string]: Series<T> };

type LambdaFunction<T, R> = (arg: T) => R;

type DataframeCreation<T> = { [K: string]: T[] } | DataframeSeries<T>;

export class DataframeFirstAttempt<T> {
  private series: DataframeSeries<T>;
  public size: number;

  constructor(data: DataframeCreation<T>) {
    this.series = {};
    this.size = 0;
    this.initialiseSeries(data);
    this.validate();
  }

  private getSeriesAtIndex = (index: number): DataframeItem<T> => {
    const obj = Object.entries(this.series);
    return Object.fromEntries(obj.map(([key, val]) => [key, val.items[index]]));
  };

  public lambda = <R>(fn: LambdaFunction<DataframeItem<T>, R>): Series<R> => {
    const lambdaResult: R[] = [];
    for (let i = 0; i < this.size; i++) {
      const series = this.getSeriesAtIndex(i);
      lambdaResult.push(fn(series));
    }
    return new Series(lambdaResult);
  };

  public add = <R>(
    creation: DataframeSeries<R> | DataframeItems<R>,
  ): DataframeFirstAttempt<T | R> => {
    let newSeries = {};
    if (creation) {
      const entries = Object.entries(creation);
      entries.forEach(([key, value]) => {
        const newSeriesItem =
          value instanceof Series ? value : new Series(value);
        newSeries = {
          ...newSeries,
          [key]: newSeriesItem,
        };
        if (newSeriesItem.items.length !== this.size)
          throw new Error(`BAD: ${this.size}, got ${value.length}`);
      });
    }
    this.series = { ...this.series, ...newSeries };
    return this as DataframeFirstAttempt<T | R>;
    // const df = new Dataframe<T | R>({ ...this.series, ...newSeries });
    // return df;
  };

  public get = (column: keyof typeof this.series) => {
    return this.series?.[column];
  };

  public head = () => {
    console.log(this.series);
  };

  private initialiseSeries = (data: DataframeCreation<T>) => {
    const columns = Object.keys(data);
    if (!columns.length) {
      this.size = 0;
      return;
    }
    let length = 0;
    columns.forEach((column) => {
      const seriesData = data[column];
      this.series[column] =
        seriesData instanceof Series ? seriesData : new Series(seriesData);
      length = this.series[column].items.length;
    });

    this.size = length;
  };

  private validate = () => {
    const columns = Object.keys(this.series);
    if (!columns.length) {
      this.size = 0;
      return;
    }
    let length = this.size;
    columns.forEach((column) => {
      const seriesLength = this.series[column]?.size;
      if (seriesLength === undefined) throw new Error("No length on series");
      if (seriesLength !== length) throw new Error("Series lengths differ");
      length = seriesLength;
    });
    this.size = length;
  };
}
