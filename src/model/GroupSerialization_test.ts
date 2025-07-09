import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { createBaseGroup } from "../../test_fixtures.ts";
import { encode, decode } from "./GroupSerialization.ts";

describe("GroupSerialization", () => {
  describe("serialization and deserialization", () => {
    it("should correctly encode and decode with bencode strings", () => {
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
      expect(typeof serialized).toBe("string");
      expect(serialized.length > 0).toBe(true);
      
      // Deserialize back to a group from string
      const deserialized = decode(serialized);
      
      // Check that the deserialized result matches the original group
      expect(deserialized).toEqual(originalGroup);
    });
  });

  describe("deserialization with invalid data", () => {
    it("should throw an error", () => {
      // Expect the decode function to throw when given invalid data
      expect(() => {
        decode("invalid bencode string");
      }).toThrow();
    });
  });
});


