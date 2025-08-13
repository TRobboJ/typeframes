### DataFrames & Series

## About

Originally inspired by my frustration in the lack of types provided in pandas,
this repo is just a pet project to learn how DataFrames and Series work under the hood.

## Series

<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./scripts/seriesExample.ts) -->
<!-- The below code snippet is automatically added from ./scripts/seriesExample.ts -->
```ts
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
```
<!-- AUTO-GENERATED-CONTENT:END *-->

### DataFrame

<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./scripts/dataframeExample.ts) -->
<!-- The below code snippet is automatically added from ./scripts/dataframeExample.ts -->
```ts
import { DataFrame } from "../src/dataframe";

const df = new DataFrame([
  { name: "Alice", age: 30, active: true },
  { name: "Bob", age: 25, active: false },
]);

/** [2, 3] */
console.log(df.shape);

/** ['name', 'age', 'active'] */
console.log(df.columns);

const meanAge = df.col("age").mean();
/** 27.5 */
console.log(meanAge);

df.pushRow({
  name: "John",
  age: 35,
  active: true,
});

/** [ { name: 'Alice', age: 30, active: true } ] */
console.log(df.head(1));

/** [ { name: 'John', age: 35, active: true } ] */
console.log(df.tail(1));

const withInitials = df.addColumn("initials", (cols) => cols.name[0]);
/**
 * [
 *  { name: 'Alice', age: 30, active: true, initials: 'A' },
 *  { name: 'Bob', age: 25, active: false, initials: 'B' } ]
 * ]
 **/
console.log(withInitials.head(2));

const dfLeft = new DataFrame([
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
]);

const dfRight = new DataFrame([
  { userId: 1, age: 25 },
  { userId: 3, age: 30 },
]);

const joined = dfLeft.leftJoin(dfRight, {
  thisKey: "id",
  otherKey: "userId",
});

/**
 * [
 *   { id: 1, name: 'Alice', age: 25 },
 *   { id: 2, name: 'Bob', age: null }
 * ]
 */

console.log(joined.head(2));

const assigned = df.assign({
  birthYear: (row) => 2025 - row.age,
  nameLength: (row) => row.name.length,
});

/**[
 *   {
 *      name: "Alice",
 *      age: 30,
 *      active: true,
 *      birthYear: 1995,
 *      nameLength: 5,
 *    },
 *    { name: "Bob", age: 25, active: false, birthYear: 2000, nameLength: 3 },
 *  ]
 */
console.log(assigned.head(2));
```
<!-- AUTO-GENERATED-CONTENT:END *-->
