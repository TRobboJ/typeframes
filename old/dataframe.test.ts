import { DataframeFirstAttempt } from "./dataframe";
import { it, expect, describe } from "vitest";
import { Series } from "../src/series";

describe("Dataframe", () => {
  it("constructor", () => {
    const dataframe = new DataframeFirstAttempt({ col1: [1], col2: [1] });
    expect(dataframe.size).toBe(1);
  });

  it("lambda", () => {
    const dataframe = new DataframeFirstAttempt({ col1: [1, 2], col2: [3, 4] });
    expect(dataframe.size).toBe(2);

    // Numbers
    const sut1 = dataframe.lambda((df) => df.col1 + df.col2).sum();
    expect(sut1).toBe(10);

    const sut2 = dataframe.lambda((df) => df.col1 * df.col2).median();
    // ( 3 + 8 ) / 2
    expect(sut2).toBe(5.5);

    const sut3 = dataframe
      .lambda((df) => df.col1 * df.col2)
      .lambda((series) => series ** 2);
    // 3 * 3, 8 * 8
    expect(sut3.items).toStrictEqual([9, 64]);

    // Number to String
    const sut4 = dataframe
      .lambda((df) => df.col1 * df.col2)
      .lambda((series) => series ** 2)
      .lambda((series) => series.toString());
    // 3 * 3, 8 * 8
    expect(sut4.items).toStrictEqual(["9", "64"]);

    // String
    const sut5 = new DataframeFirstAttempt({
      col1: ["hello", "goodbye"],
    }).lambda((df) => `${df.col1} world!`);
    expect(sut5.items).toStrictEqual(["hello world!", "goodbye world!"]);
  });

  it("assignment", () => {
    const dataframe = new DataframeFirstAttempt({
      col1: [10, 20],
      col2: [5, 10],
    });
    dataframe.add({
      littleNumbers: dataframe.lambda((df) => df.col1 - df.col2),
    });
    const series = new Series([100, 60]);
    dataframe.add({ bigNumbers: series });
    dataframe.add({
      newNumbers: dataframe.lambda((df) => df.bigNumbers - df.littleNumbers),
    });
    dataframe.add({
      testString: dataframe.lambda((df) => df.newNumbers.toString()),
    });
    expect(dataframe.get("newNumbers").items).toStrictEqual([95, 50]);
    expect(dataframe.get("testString").items).toStrictEqual(["95", "50"]);
  });
});
