import { assertEquals } from "@std/assert";
import { revision, transactions, agents, groupId } from "./Group.ts";
import { createBaseGroup } from "../../test_fixtures.ts";

Deno.test("Group accessor functions", () => {
  const group = createBaseGroup({
    revision: 5,
    description: "Test Group",
    timestamp: 1672500000000,
  });

  // Test revision function
  assertEquals(revision(group), 5);
  
  // Test transactions function
  assertEquals(transactions(group).length, 1);
  assertEquals(transactions(group)[0][0], "Dinner");
  
  // Test agents function
  assertEquals(agents(group).length, 2);
  assertEquals(agents(group)[0][1], "Bob");
  assertEquals(agents(group)[1][1], "Charlie");
  
  // Test groupId function
  assertEquals(groupId(group), ["Test Group", 1672500000000]);
});
