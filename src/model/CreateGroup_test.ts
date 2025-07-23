import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { createGroup } from "./CreateGroup.ts";
import { agents, groupId, revision } from "./Group.ts";

describe("CreateGroup", () => {
  describe("createGroup function", () => {
    it("should create a new group with the given description", () => {
      const description = "Trip to Paris";
      const group = createGroup(description);

      expect(groupId(group)[0]).toBe(description);
      expect(typeof groupId(group)[1]).toBe("number");
    });

    it("should create a group with initial revision 1", () => {
      const group = createGroup("Test Group");
      expect(revision(group)).toBe(1);
    });

    it("should create a group with no agents initially", () => {
      const group = createGroup("Test Group");
      expect(agents(group).length).toBe(0);
    });

    it("should create a group with no transactions initially", () => {
      const group = createGroup("Test Group");
      expect(group[6].length).toBe(0);
    });

    it("should create a group with the correct structure", () => {
      const group = createGroup("Test Group");

      // Check group structure
      expect(group[0]).toBe("cs");
      expect(group[1]).toBe(1);
      expect(Array.isArray(group[5])).toBe(true);
      expect(Array.isArray(group[6])).toBe(true);
    });

    it("should create a group with participants when provided", () => {
      const participants = ["Alice", "Bob", "Charlie"];
      const group = createGroup("Test Group", participants);

      const groupAgents = agents(group);
      expect(groupAgents.length).toBe(3);
      expect(groupAgents[0][1]).toBe("Alice");
      expect(groupAgents[1][1]).toBe("Bob");
      expect(groupAgents[2][1]).toBe("Charlie");
      
      // Check that agent IDs are sequential starting from 1
      expect(groupAgents[0][0]).toBe(1);
      expect(groupAgents[1][0]).toBe(2);
      expect(groupAgents[2][0]).toBe(3);
    });

    it("should create a group with no participants when empty array provided", () => {
      const group = createGroup("Test Group", []);
      expect(agents(group).length).toBe(0);
    });

    it("should create a group with no participants when participants not provided", () => {
      const group = createGroup("Test Group");
      expect(agents(group).length).toBe(0);
    });
  });
});
