import { Series } from "../src/series";

const series = new Series([1, 2, 3, 4, 5], "myNumbers");
const mean = series.mean();
/** 3 */
console.log("mean: ", mean);

const median = series.median();
/** 3 */
console.log("median: ", median);

const min = series.min();
/** 1 */
console.log("min: ", min);

const max = series.max();
/** 5 */
console.log("max: ", max);

const sum = series.sum();
/** 15 */
console.log("sum: ", sum);

const concatSeries = series.concat([6, 7, 8, 9, 10]);
/** [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] */
console.log(concatSeries.items);

const stringSeries = concatSeries.lambda((num) => num.toString(), "myStrings");
/** ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] */
console.log(stringSeries.items);

const nullishFilledSeries = new Series(
  [1, undefined, false, null, Number.NaN, 10, ""],
  "myNullishMix",
).fillNullish(0);
/** [1, 0, false, 0, 0, 10, ''] */
console.log(nullishFilledSeries.items);

const falseyFilledSeries = new Series(
  [1, undefined, false, null, Number.NaN, 10, ""],
  "myFalseyMix",
).fillFalsey(0);
/** [1, 0, 0, 0, 0, 10, 0] */
console.log(falseyFilledSeries.items);
