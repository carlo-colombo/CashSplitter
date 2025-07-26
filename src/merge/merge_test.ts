import { expect } from "@std/expect";
import { it } from "@std/testing/bdd";
import { merge } from "./merge.ts";

it("should combine transactions correctly when groups have the same agents", () => {
  const group1 = [
    "cs",
    2,
    1,
    "Trip expenses",
    1672400000000,
    [
      [1, 1, "Bob"],
      [1, 2, "Charlie"],
      [3, "Dinner", 1672444800000, [[1, 30], [2, -30]]],
    ],
  ];
  const group2 = [
    "cs",
    2,
    1,
    "Trip expenses",
    1672400000000,
    [
      [1, 1, "Bob"],
      [1, 2, "Charlie"],
      [3, "Lunch", 1672531200000, [[1, 50], [2, -50]]],
      [3, "Coffee", 1672617600000, [[1, 10], [2, -10]]],
    ],
  ];
  const expected = [
    "cs",
    2,
    2,
    "Trip expenses",
    1672400000000,
    [
      [1, 1, "Bob"],
      [1, 2, "Charlie"],
      [3, "Dinner", 1672444800000, [[1, 30], [2, -30]]],
      [3, "Lunch", 1672531200000, [[1, 50], [2, -50]]],
      [3, "Coffee", 1672617600000, [[1, 10], [2, -10]]],
    ],
  ];
  expect(
    merge(
      group1 as import("../model/Group.ts").Group2,
      group2 as import("../model/Group.ts").Group2,
    ),
  ).toEqual(expected as import("../model/Group.ts").Group2);
});
