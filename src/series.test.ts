import { Series } from "./series";
import { it, expect, describe } from "vitest";

describe("Series", () => {
  it("constructor", () => {
    const series = new Series([1]);
    expect(series.size).toBe(1);
  });

  // Functional

  it("lambda", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(series.size).toBe(5);
    const sut = series.lambda((x) => x * 2);
    expect(sut.size).toBe(5);
    expect(sut.items).toStrictEqual([2, 4, 6, 8, 10]);
  });

  it("concat", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(series.size).toBe(5);
    const sut = series.concat([6, 7, 8, 9, 10]);
    expect(sut.size).toBe(10);
    expect(sut.items).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("concat - mixed types", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(series.size).toBe(5);
    const sut = series.concat(["6", "7", "8", "9", "10"]);
    expect(sut.size).toBe(10);
    expect(sut.items).toStrictEqual([1, 2, 3, 4, 5, "6", "7", "8", "9", "10"]);
    expect(sut.max()).toBe(5);
  });

  it("head", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(series.head()).toStrictEqual([1]);
    expect(series.head(3)).toStrictEqual([1, 2, 3]);
  });

  it("tail", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(series.tail()).toStrictEqual([5]);
    expect(series.tail(3)).toStrictEqual([3, 4, 5]);
  });

  // Math

  it("sum", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const sum = series.sum();
    expect(sum).toBe(15);
    const series2 = new Series([""]);
    const sum2 = series2.sum();
    expect(sum2).toBe(0);
    const series3 = new Series(["", 1, 2]);
    const sum3 = series3.sum();
    expect(sum3).toBe(3);
  });

  it("max", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const max = series.max();
    expect(max).toBe(5);
    const series2 = new Series([""]);
    const max2 = series2.max();
    expect(max2).toBeUndefined();
    const series3 = new Series(["", 1, 2]);
    const max3 = series3.max();
    expect(max3).toBe(2);
  });

  it("min", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const min = series.min();
    expect(min).toBe(1);
    const series2 = new Series([""]);
    const min2 = series2.min();
    expect(min2).toBeUndefined();
    const series3 = new Series(["", 1, 2]);
    const min3 = series3.min();
    expect(min3).toBe(1);
  });

  it("mean", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const mean = series.mean();
    expect(mean).toBe(3);
    const series2 = new Series([""]);
    const mean2 = series2.mean();
    expect(mean2).toBe(0);
    const series3 = new Series(["", 1, 2]);
    const mean3 = series3.mean();
    expect(mean3).toBe(1.5);
  });

  it("median", () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const median = series.median();
    expect(median).toBe(3);
    const series2 = new Series([""]);
    const median2 = series2.median();
    expect(median2).toBeUndefined();
    const series3 = new Series(["", 1, 2]);
    const median3 = series3.median();
    expect(median3).toBe(1.5);
    const series4 = new Series(["", 1, 2, 3, 4]);
    const median4 = series4.median();
    expect(median4).toBe(2.5);
  });
});
