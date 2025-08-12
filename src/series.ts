type SeriesLambda<SeriesType, SeriesReturnType> = (
  value: SeriesType,
  i: number,
) => SeriesReturnType;

export class Series<SeriesType, SeriesName extends PropertyKey> {
  public items: SeriesType[];
  public name: SeriesName;

  constructor(items: SeriesType[], name: SeriesName) {
    this.items = items;
    this.name = name;
  }

  get size(): number {
    return this.items.length;
  }
  public lambda<SeriesReturnType>(
    fn: SeriesLambda<SeriesType, SeriesReturnType>,
  ): Series<SeriesReturnType, SeriesName>;
  public lambda<SeriesReturnType, NewSeriesName extends PropertyKey>(
    fn: SeriesLambda<SeriesType, SeriesReturnType>,
    newName: NewSeriesName,
  ): Series<SeriesReturnType, NewSeriesName>;
  public lambda<SeriesReturnType, NewSeriesName extends PropertyKey>(
    fn: SeriesLambda<SeriesType, SeriesReturnType>,
    newName?: NewSeriesName,
  ): Series<SeriesReturnType, SeriesName | NewSeriesName> {
    const newItems = this.items.map((item, i) => fn(item, i));
    return new Series(
      newItems,
      (newName ?? this.name) as SeriesName | NewSeriesName,
    );
  }

  public concat<R>(newItems: R[]): Series<SeriesType | R, SeriesName>;
  public concat<R, NewSeriesName extends PropertyKey>(
    newItems: R[],
    newName: NewSeriesName,
  ): Series<SeriesType | R, NewSeriesName>;
  public concat<R, NewSeriesName extends PropertyKey>(
    newItems: R[],
    newName?: NewSeriesName,
  ): Series<SeriesType | R, SeriesName | NewSeriesName> {
    return new Series(
      [...this.items, ...newItems],
      (newName ?? this.name) as SeriesName | NewSeriesName,
    );
  }

  public toArray = (): SeriesType[] => {
    return [...this.items];
  };

  public sum = () => {
    if (!this.size) return 0;
    return this.items.reduce(
      (acc, cur) =>
        (typeof acc === "number" ? acc : 0) +
        (typeof cur === "number" ? cur : 0),
      0,
    );
  };

  public max = () => {
    if (!this.size) return undefined;
    const res = Math.max(
      ...this.items.map((item) =>
        typeof item === "number" ? item : Number.NEGATIVE_INFINITY,
      ),
    );
    if (Number.isFinite(res)) return res;
    return undefined;
  };

  public min = () => {
    if (!this.size) return undefined;
    const res = Math.min(
      ...this.items.map((item) =>
        typeof item === "number" ? item : Number.POSITIVE_INFINITY,
      ),
    );
    if (Number.isFinite(res)) return res;
    return undefined;
  };

  public mean = () => {
    if (!this.size) return undefined;
    let validCount = 0;
    let total = 0;
    for (let i = 0; i < this.size; i++) {
      const currValue = this.items[i];
      if (this.isValidNumber(currValue)) {
        total += currValue;
        validCount++;
      }
    }
    if (!total || !validCount) return 0;
    return total / validCount;
  };

  public median = () => {
    if (!this.size) return undefined;
    const numberValues: number[] = [];
    for (let i = 0; i < this.size; i++) {
      const currValue = this.items[i];
      if (this.isValidNumber(currValue)) numberValues.push(currValue);
    }
    if (!numberValues.length) return undefined;
    const sorted = numberValues.sort((a, b) => a - b);
    if (sorted.length === 1) return sorted[0];
    if (sorted.length === 2) return (sorted[0] + sorted[1]) / 2;
    const isOdd = sorted.length % 2 === 1;
    const half = Math.floor(sorted.length / 2);
    return isOdd ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
  };

  public fill = <FillValue, ReplacementValues extends readonly unknown[]>(
    fill: FillValue,
    ...find: ReplacementValues
  ): Series<
    Exclude<SeriesType, ReplacementValues[number]> | FillValue,
    SeriesName
  > => {
    if (!this.size) return new Series([], this.name);
    const newItems = this.items.map((item) =>
      find.includes(item) ? fill : item,
    );
    return new Series(newItems, this.name) as Series<
      Exclude<SeriesType, ReplacementValues[number]> | FillValue,
      SeriesName
    >;
  };

  public fillNullish = <FillValue>(fill: FillValue) => {
    if (!this.size) return new Series([], this.name);
    return this.fill(fill, undefined, null, Number.NaN);
  };

  public fillFalsey = <FillValue>(fill: FillValue) => {
    if (!this.size) return new Series([], this.name);
    return this.fill(fill, undefined, null, Number.NaN, 0, "", false);
  };

  public forwardFill = (
    isValid: (value: SeriesType) => boolean = (v) => !!v,
  ): Series<SeriesType, SeriesName> => {
    if (!this.size) return new Series([], this.name);

    let lastValidValue: SeriesType | undefined;
    const newItems: SeriesType[] = [];
    for (let i = 0; i < this.size; i++) {
      const value = this.items[i];
      if (isValid(value)) {
        lastValidValue = value;
      }
      newItems.push(lastValidValue ?? value);
    }
    return new Series(newItems, this.name);
  };

  public backwardFill = (
    isValid: (value: SeriesType) => boolean = (v) => !!v,
  ): Series<SeriesType, SeriesName> => {
    if (!this.size) return new Series([], this.name);

    let lastValidValue: SeriesType | undefined;
    const newItems: SeriesType[] = new Array(this.size);
    for (let i = this.size - 1; i >= 0; i--) {
      const value = this.items[i];
      if (isValid(value)) {
        lastValidValue = value;
        newItems[i] = lastValidValue;
      } else {
        newItems[i] = lastValidValue ?? value;
      }
    }
    return new Series(newItems, this.name);
  };

  public head = (n = 1) => {
    if (!this.size) return undefined;
    return this.items.slice(0, n);
  };

  public tail = (n = 1) => {
    if (!this.size) return undefined;
    if (n > this.size - 1) return this.items;
    return this.items.slice(this.size - n);
  };

  private isValidNumber = (val: unknown): val is number => {
    return (
      typeof val === "number" && !Number.isNaN(val) && Number.isFinite(val)
    );
  };
}
