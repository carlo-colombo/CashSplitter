import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { createGroup } from "./CreateGroup.ts";

describe("CreateGroup", () => {
  describe("createGroup function", () => {
    it("should create a new group with the given description", () => {
      const description = "Trip to Paris";
      const group = createGroup(description);

      expect(group[3]).toBe(description);
      expect(typeof group[4]).toBe("number");
    });

    it("should create a group with initial revision 1", () => {
      const group = createGroup("Test Group");
      expect(group[2]).toBe(1); // revision is at index 2 in Group2
    });

    it("should create a group with no operations initially when no participants", () => {
      const group = createGroup("Test Group");
      expect(group[5].length).toBe(0); // operations array should be empty
    });

    it("should create a group with the correct Group2 structure", () => {
      const group = createGroup("Test Group");

      // Check group structure
      expect(group[0]).toBe("cs");
      expect(group[1]).toBe(2); // Version 2 for Group2
      expect(group[2]).toBe(1); // Initial revision
      expect(group[3]).toBe("Test Group"); // Description
      expect(typeof group[4]).toBe("number"); // Timestamp
      expect(Array.isArray(group[5])).toBe(true); // Operations array
    });

    it("should create a group with AddUser operations when participants provided", () => {
      const participants = ["Alice", "Bob", "Charlie"];
      const group = createGroup("Test Group", participants);

      const operations = group[5];
      expect(operations.length).toBe(3);

      // Check first AddMember operation
      const firstOp = operations[0];
      expect(firstOp[0]).toBe(1); // Operation type 1 for AddMember
      expect(firstOp[1]).toBe(1); // User ID 1
      expect(firstOp[2]).toBe("Alice"); // User name

      // Check second AddMember operation
      const secondOp = operations[1];
      expect(secondOp[0]).toBe(1);
      expect(secondOp[1]).toBe(2);
      expect(secondOp[2]).toBe("Bob");

      // Check third AddMember operation
      const thirdOp = operations[2];
      expect(thirdOp[0]).toBe(1);
      expect(thirdOp[1]).toBe(3);
      expect(thirdOp[2]).toBe("Charlie");
    });

    it("should create a group with no operations when empty array provided", () => {
      const group = createGroup("Test Group", []);
      expect(group[5].length).toBe(0);
    });

    it("should create a group with no operations when participants not provided", () => {
      const group = createGroup("Test Group");
      expect(group[5].length).toBe(0);
    });
  });
});
