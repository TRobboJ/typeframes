import { DataFrame } from "./dataframe";
import { Series } from "./series";
import { it, expect, describe, beforeEach } from "vitest";
let df: DataFrame<{ name: string; age: number; active: boolean }>;

beforeEach(() => {
  df = new DataFrame([
    { name: "Alice", age: 30, active: true },
    { name: "Bob", age: 25, active: false },
  ]);
});

describe("DataFrame", () => {
  describe("Usability", () => {
    it("converts a column to Series and back to DataFrame", () => {
      const series = df.col("age");
      const asArray = series.toArray();
      expect(asArray.length).toBeGreaterThan(0);
      expect(typeof asArray[0]).toBe("number");
      const newDf = new DataFrame([{ [series.name]: asArray }]);
      expect(newDf.head(1).length).toBe(1);
    });
  });

  describe("col()", () => {
    it("returns a Series of the specified column", () => {
      const col = df.col("name");
      expect(col).toBeInstanceOf(Series);
      expect(col.toArray()).toEqual(["Alice", "Bob"]);
    });
  });

  describe("select()", () => {
    it("returns DataFrame with only selected columns", () => {
      const selected = df.select("name", "active");
      expect(selected.shape).toEqual([2, 2]);
      expect(selected.toArray()).toEqual([
        { name: "Alice", active: true },
        { name: "Bob", active: false },
      ]);
    });
  });

  describe("drop()", () => {
    it("returns DataFrame without dropped columns", () => {
      const dropped = df.drop("active");
      expect(dropped.shape).toEqual([2, 2]);
      expect(dropped.toArray()).toEqual([
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ]);
    });
  });

  describe("assign()", () => {
    it("adds new columns based on functions of rows", () => {
      const assigned = df.assign({
        birthYear: (r) => 2025 - r.age,
        nameLength: (r) => r.name.length,
      });
      expect(assigned.shape).toEqual([2, 5]);
      expect(assigned.toArray()).toEqual([
        {
          name: "Alice",
          age: 30,
          active: true,
          birthYear: 1995,
          nameLength: 5,
        },
        { name: "Bob", age: 25, active: false, birthYear: 2000, nameLength: 3 },
      ]);
    });
  });

  describe("mapRows()", () => {
    it("transforms each row to a new shape", () => {
      const mapped = df.mapRows((row) => ({ initials: row.name[0] }));
      expect(mapped.toArray()).toEqual([{ initials: "A" }, { initials: "B" }]);
    });
  });

  describe("filterRows()", () => {
    it("returns only rows that pass the predicate", () => {
      const filtered = df.filterRows((row) => row.active);
      expect(filtered.toArray()).toEqual([
        { name: "Alice", age: 30, active: true },
      ]);
    });
  });

  describe("push()", () => {
    it("adds a new row", () => {
      df.push({ name: "Charlie", age: 40, active: true });
      expect(df.shape).toEqual([3, 3]);
      expect(df.toArray()[2]).toEqual({
        name: "Charlie",
        age: 40,
        active: true,
      });
    });
  });

  describe("toArray()", () => {
    it("returns a shallow copy of rows", () => {
      const arr = df.toArray();
      expect(arr).toEqual([
        { name: "Alice", age: 30, active: true },
        { name: "Bob", age: 25, active: false },
      ]);
      expect(arr).not.toBe(df.rows); // should be a new array
    });
  });

  describe("head()", () => {
    it("returns first n rows", () => {
      df.push({ name: "Charlie", age: 40, active: false });
      const head = df.head(2);
      expect(head).toEqual([
        { name: "Alice", age: 30, active: true },
        { name: "Bob", age: 25, active: false },
      ]);
    });
  });

  describe("shape", () => {
    it("returns [rows, columns]", () => {
      expect(df.shape).toEqual([2, 3]);
      const empty = new DataFrame([]);
      expect(empty.shape).toEqual([0, 0]);
    });
  });

  describe("iloc()", () => {
    let df: DataFrame<{ name: string; age: number }>;

    beforeEach(() => {
      df = new DataFrame([
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 40 },
      ]);
    });

    it("selects single row by index", () => {
      const row = df.iloc(1);
      expect(row.toArray()).toEqual([{ name: "Bob", age: 25 }]);
    });

    it("selects multiple rows by array of indices", () => {
      const rows = df.iloc([0, 2]);
      expect(rows.toArray()).toEqual([
        { name: "Alice", age: 30 },
        { name: "Charlie", age: 40 },
      ]);
    });

    it("selects rows by slice object", () => {
      const rows = df.iloc({ start: 0, end: 2 });
      expect(rows.toArray()).toEqual([
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ]);
    });

    it("selects rows by slice with step", () => {
      const rows = df.iloc({ start: 0, end: 3, step: 2 });
      expect(rows.toArray()).toEqual([
        { name: "Alice", age: 30 },
        { name: "Charlie", age: 40 },
      ]);
    });

    it("throws on out-of-bounds single index", () => {
      expect(() => df.iloc(10)).toThrow(RangeError);
      expect(() => df.iloc(-1)).toThrow(RangeError);
    });

    it("throws on out-of-bounds index in array", () => {
      expect(() => df.iloc([0, 3])).toThrow(RangeError);
    });

    it("throws on invalid slice parameters", () => {
      expect(() => df.iloc({ start: -1, end: 2 })).toThrow(RangeError);
      expect(() => df.iloc({ start: 1, end: 5 })).toThrow(RangeError);
      expect(() => df.iloc({ start: 0, end: 3, step: 0 })).toThrow(RangeError);
    });
  });
});
