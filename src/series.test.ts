import { Series } from "./series";
import { it, expect, describe } from "vitest";

describe("Series", () => {
  it("constructor", () => {
    const series = new Series([1], "numbers");
    expect(series.size).toBe(1);
  });

  // Functional

  it("lambda", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    expect(series.size).toBe(5);
    expect(series.name).toBe("numbers");
    const sut = series.lambda((x) => x * 2);
    expect(sut.size).toBe(5);
    expect(sut.items).toStrictEqual([2, 4, 6, 8, 10]);

    const sut2 = sut.lambda((x) => x.toString(), "strings");
    expect(sut2.name).toBe("strings");
  });

  it("concat", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    expect(series.size).toBe(5);
    const sut = series.concat([6, 7, 8, 9, 10]);
    expect(sut.size).toBe(10);
    expect(sut.items).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("concat - mixed types", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    expect(series.size).toBe(5);
    const sut = series.concat(["6", "7", "8", "9", "10"], "mixed");
    expect(sut.size).toBe(10);
    expect(sut.name).toBe("mixed");
    expect(sut.items).toStrictEqual([1, 2, 3, 4, 5, "6", "7", "8", "9", "10"]);
    expect(sut.max()).toBe(5);
  });

  it("head", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    expect(series.head()).toStrictEqual([1]);
    expect(series.head(3)).toStrictEqual([1, 2, 3]);
  });

  it("tail", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    expect(series.tail()).toStrictEqual([5]);
    expect(series.tail(3)).toStrictEqual([3, 4, 5]);
  });

  describe("fill", () => {
    it("one argument", () => {
      const series = new Series([1, undefined, 3, undefined, 5, null], "mixed");
      const sut = series.fill("MISSING", undefined);
      expect(sut.toArray()).toStrictEqual([
        1,
        "MISSING",
        3,
        "MISSING",
        5,
        null,
      ]);
    });

    it("multiple arguments", () => {
      const series = new Series([1, undefined, 3, undefined, 5, null], "mixed");
      const sut = series.fill(0, undefined, null);
      expect(sut.toArray()).toStrictEqual([1, 0, 3, 0, 5, 0]);
    });

    it("fillNullish", () => {
      const series = new Series(
        [1, undefined, 3, undefined, 5, null, Number.NaN],
        "mixed",
      );
      const sut = series.fillNullish(0);
      expect(sut.toArray()).toStrictEqual([1, 0, 3, 0, 5, 0, 0]);
    });

    it("fillFalsey", () => {
      const series = new Series(
        [1, undefined, 3, undefined, 5, null, Number.NaN, "", 0, false],
        "mixed",
      );
      const sut = series.fillFalsey(1);
      expect(sut.toArray()).toStrictEqual([1, 1, 3, 1, 5, 1, 1, 1, 1, 1]);
    });

    it("forwardFill - basic", () => {
      const series = new Series(
        [1, undefined, 3, undefined, 5, null, Number.NaN, "", 0, false],
        "mixed",
      );
      const sut = series.forwardFill();
      expect(sut.toArray()).toStrictEqual([1, 1, 3, 3, 5, 5, 5, 5, 5, 5]);
    });

    it("forwardFill - lambda", () => {
      const series = new Series(
        [1, undefined, 3, undefined, 5, null, Number.NaN, "", 0, false],
        "mixed",
      );
      const sut = series.forwardFill((val) => !!val || val === "");
      expect(sut.toArray()).toStrictEqual([1, 1, 3, 3, 5, 5, 5, "", "", ""]);
    });

    it("backwardFill - basic", () => {
      const series = new Series(
        [1, undefined, 3, undefined, 5, null, Number.NaN, "", 0, false],
        "mixed",
      );
      const sut = series.backwardFill();
      expect(sut.toArray()).toStrictEqual([
        1,
        3,
        3,
        5,
        5,
        null,
        Number.NaN,
        "",
        0,
        false,
      ]);
    });

    it("backwardFill - lambda", () => {
      const series = new Series(
        [1, undefined, 3, undefined, 5, null, Number.NaN, "", 0, false],
        "mixed",
      );
      const sut = series.backwardFill((val) => !!val || val === "");
      expect(sut.toArray()).toStrictEqual([
        1,
        3,
        3,
        5,
        5,
        "",
        "",
        "",
        0,
        false,
      ]);
    });
  });

  // Math

  it("sum", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    const sum = series.sum();
    expect(sum).toBe(15);
    const series2 = new Series([""], "mixed");
    const sum2 = series2.sum();
    expect(sum2).toBe(0);
    const series3 = new Series(["", 1, 2], "mixed");
    const sum3 = series3.sum();
    expect(sum3).toBe(3);
  });

  it("max", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    const max = series.max();
    expect(max).toBe(5);
    const series2 = new Series([""], "mixed");
    const max2 = series2.max();
    expect(max2).toBeUndefined();
    const series3 = new Series(["", 1, 2], "mixed");
    const max3 = series3.max();
    expect(max3).toBe(2);
  });

  it("min", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    const min = series.min();
    expect(min).toBe(1);
    const series2 = new Series([""], "mixed");
    const min2 = series2.min();
    expect(min2).toBeUndefined();
    const series3 = new Series(["", 1, 2], "mixed");
    const min3 = series3.min();
    expect(min3).toBe(1);
  });

  it("mean", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    const mean = series.mean();
    expect(mean).toBe(3);
    const series2 = new Series([""], "mixed");
    const mean2 = series2.mean();
    expect(mean2).toBe(0);
    const series3 = new Series(["", 1, 2], "mixed");
    const mean3 = series3.mean();
    expect(mean3).toBe(1.5);
    const series4 = new Series(
      [
        Number.POSITIVE_INFINITY,
        1,
        4,
        100,
        Number.NaN,
        undefined,
        null,
        "",
        "100",
      ],
      "mixed",
    );
    const mean4 = series4.mean();
    expect(mean4).toBe(35);
  });

  it("median", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    const median = series.median();
    expect(median).toBe(3);
    const series2 = new Series([""], "mixed");
    const median2 = series2.median();
    expect(median2).toBeUndefined();
    const series3 = new Series(["", 1, 2], "mixed");
    const median3 = series3.median();
    expect(median3).toBe(1.5);
    const series4 = new Series(["", 1, 2, 3, 4], "mixed");
    const median4 = series4.median();
    expect(median4).toBe(2.5);
    const series5 = new Series(
      [
        Number.POSITIVE_INFINITY,
        1,
        4,
        5,
        100,
        Number.NaN,
        undefined,
        null,
        "",
        "100",
      ],
      "mixed",
    );
    const median5 = series5.median();
    expect(median5).toBe(4.5);
  });

  it("quantile", () => {
    const series = new Series([1, 2, 3, 4, 5], "numbers");
    const quantile = series.quantile(0.5);
    expect(quantile).toBe(3);
    const series2 = new Series([""], "mixed");
    const quantile2 = series2.quantile(1);
    expect(quantile2).toBeUndefined();
    const series3 = new Series(["", 1, 2], "mixed");
    const quantile3 = series3.quantile(1);
    expect(quantile3).toBe(2);
    const series4 = new Series(["", 1, 2, 3, 4], "mixed");
    const quantile4 = series4.quantile(0);
    expect(quantile4).toBe(1);
    const series5 = new Series(
      [
        Number.POSITIVE_INFINITY,
        1,
        4,
        5,
        100,
        Number.NaN,
        undefined,
        null,
        "",
        "100",
      ],
      "mixed",
    );
    const quantile5 = series5.quantile(0.75);
    expect(quantile5).toBe(28.75);
  });
});
