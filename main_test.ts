import { assertEquals } from "@std/assert";
import { Group, merge } from "./main.ts";

Deno.test("merge two group objects with same agents, one with transactions", () => {
  // First group object with agents and one transaction
  const group1: Group = [
    "cs",
    1,
    1,
    "Trip expenses", // GroupDescription
    1672400000000, // Timestamp
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]]
    ]
  ];

  // Second group object with same agents and some transactions
  const group2: Group = [
    "cs",
    1,
    1,
    "Trip expenses", // GroupDescription
    1672400000000, // Timestamp
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Lunch", 1672531200000, [[1, 50], [2, -50]]],
      ["Coffee", 1672617600000, [[1, 10], [2, -10]]],
    ]
  ];

  // Expected result after merging
  const expected: Group = [
    "cs",
    1,
    2,
    "Trip expenses", // GroupDescription
    1672400000000, // Timestamp
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]],
      ["Lunch", 1672531200000, [[1, 50], [2, -50]]],
      ["Coffee", 1672617600000, [[1, 10], [2, -10]]],
    ]
  ];
  
  // Test the merge function with our updated Group type
  assertEquals(merge(group1, group2), expected);
});

