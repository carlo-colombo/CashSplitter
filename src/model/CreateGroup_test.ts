import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";
import { createGroup } from "./CreateGroup.ts";
import { groupId, revision, agents } from "./Group.ts";

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
  });
});
