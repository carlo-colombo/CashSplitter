import { assertEquals, assertThrows } from "@std/assert";
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

Deno.test("merge rejects groups with different descriptions or timestamps", () => {
  // First group
  const group1: Group = [
    "cs",
    1,
    1,
    "Trip expenses", 
    1672400000000,
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]]
    ]
  ];

  // Second group with different description
  const group2DiffDesc: Group = [
    "cs",
    1,
    1,
    "Different trip expenses", // Different description
    1672400000000, 
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Lunch", 1672531200000, [[1, 50], [2, -50]]]
    ]
  ];

  // Third group with different timestamp
  const group2DiffTime: Group = [
    "cs",
    1,
    1,
    "Trip expenses",
    1673000000000, // Different timestamp
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Lunch", 1672531200000, [[1, 50], [2, -50]]]
    ]
  ];

  // Test that merging groups with different descriptions throws an error
  assertThrows(
    () => merge(group1, group2DiffDesc),
    Error,
    "Cannot merge groups with different descriptions"
  );

  // Test that merging groups with different timestamps throws an error
  assertThrows(
    () => merge(group1, group2DiffTime),
    Error,
    "Cannot merge groups with different creation timestamps"
  );
});

