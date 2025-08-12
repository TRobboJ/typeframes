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
