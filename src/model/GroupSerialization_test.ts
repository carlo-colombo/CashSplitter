import { assertEquals } from "@std/assert";
import { createBaseGroup } from "../../test_fixtures.ts";
import { encode, decode } from "./GroupSerialization.ts";

Deno.test("Group serialization and deserialization with bencode strings", () => {
  // Create a test group
  const originalGroup = createBaseGroup({
    revision: 5,
    description: "Test Serialization",
    timestamp: 1672500000000,
    transactions: [
      ["Dinner", 1672444800000, [[1, 30], [2, -30]]],
      ["Lunch", 1672531200000, [[1, 50], [2, -50]]],
      ["Coffee", 1672617600000, [[1, 10], [2, -10]]]
    ]
  });
  
  // Serialize the group to string
  const serialized = encode(originalGroup);
  
  // Check that serialized result is a string
  assertEquals(typeof serialized, "string");
  assertEquals(serialized.length > 0, true);
  
  // Deserialize back to a group from string
  const deserialized = decode(serialized);
  
  // Check that the deserialized result matches the original group
  assertEquals(deserialized, originalGroup);
});

Deno.test("Group deserialization should fail with invalid data", () => {
  try {
    // Invalid bencode string
    decode("invalid bencode string");
    assertEquals(true, false, "Expected decode to throw an error");
  } catch (error) {
    // This should throw an error, which is expected
    assertEquals(error instanceof Error, true);
  }
});
