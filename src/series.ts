type LambdaFunction<T, R> = (...args: T[]) => R;

export class Series<T, N extends PropertyKey> {
  public items: T[];
  public name: N;

  constructor(items: T[], name: N) {
    this.items = items;
    this.name = name;
  }

  get size(): number {
    return this.items.length;
  }

  public lambda = <R>(fn: LambdaFunction<T, R>): Series<R, N> => {
    const newItems = this.items.map((item) => fn(item));
    return new Series(newItems, this.name);
  };

  public concat = <R>(newItems: R[]): Series<T | R, N> => {
    return new Series([...this.items, ...newItems], this.name);
  };

  public toArray = (): T[] => {
    return [...this.items];
  };

  public sum = () => {
    if (!this.items.length) return 0;
    return this.items.reduce(
      (acc, cur) =>
        (typeof acc === "number" ? acc : 0) +
        (typeof cur === "number" ? cur : 0),
      0,
    );
  };

  public max = () => {
    if (!this.items.length) return undefined;
    const res = Math.max(
      ...this.items.map((item) =>
        typeof item === "number" ? item : Number.NEGATIVE_INFINITY,
      ),
    );
    if (Number.isFinite(res)) return res;
    return undefined;
  };

  public min = () => {
    if (!this.items.length) return undefined;
    const res = Math.min(
      ...this.items.map((item) =>
        typeof item === "number" ? item : Number.POSITIVE_INFINITY,
      ),
    );
    if (Number.isFinite(res)) return res;
    return undefined;
  };

  public mean = () => {
    if (!this.items.length) return undefined;
    const sorted = this.items
      .map((it) => (Number.isFinite(it) ? it : null))
      .filter((it) => typeof it === "number")
      .toSorted();
    const sum = this.sum();
    if (!sum) return 0;
    return sum / sorted.length;
  };

  public median = () => {
    if (!this.items.length) return undefined;
    const sorted = this.items
      .map((it) => (Number.isFinite(it) ? it : null))
      .filter((it) => typeof it === "number")
      .toSorted();
    if (!sorted.length) return undefined;
    if (sorted.length === 1) return sorted[0];
    if (sorted.length === 2) return (sorted[0] + sorted[1]) / 2;
    const isOdd = sorted.length % 2 === 1;
    const half = Math.floor(sorted.length / 2);
    return isOdd ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
  };

  public head = (n = 1) => {
    if (!this.items.length) return undefined;
    return this.items.slice(0, n);
  };

  public tail = (n = 1) => {
    if (!this.items.length) return undefined;
    if (n > this.items.length - 1) return this.items;
    return this.items.slice(this.items.length - n);
  };
}
