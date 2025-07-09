import { assertEquals } from "@std/assert";
import { Group, GROUP_HEADER, GROUP_VERSION, GROUP_REVISION, GROUP_DESCRIPTION, 
  GROUP_CREATION_TIMESTAMP, GROUP_AGENTS, GROUP_TRANSACTIONS } from "./main.ts";

Deno.test("Group type should include GroupDescription and Timestamp", () => {
  // Creating a group with description and timestamp
  const group: Group = [
    "cs",
    1,
    2, // revision
    "Trip to Paris", // GroupDescription
    1720000000000, // Timestamp when the group was created (July 2024)
    [
      [1, "Bob"],
      [2, "Charlie"],
    ],
    [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]]
    ]
  ];
  
  // Check that the group has the correct structure using constants
  assertEquals(group[GROUP_HEADER], "cs");
  assertEquals(group[GROUP_VERSION], 1);
  assertEquals(group[GROUP_REVISION], 2);
  assertEquals(group[GROUP_DESCRIPTION], "Trip to Paris");
  assertEquals(group[GROUP_CREATION_TIMESTAMP], 1720000000000);
  assertEquals(group[GROUP_AGENTS].length, 2);
  assertEquals(group[GROUP_TRANSACTIONS].length, 1);
});
