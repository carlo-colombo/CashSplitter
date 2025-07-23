import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { agents, groupId, revision, transactions } from "./Accessors.ts";
import { createBaseGroup } from "../../test_fixtures.ts";

describe("Group Accessors", () => {
  const group = createBaseGroup({
    revision: 5,
    description: "Test Group",
    timestamp: 1672500000000,
  });

  describe("revision function", () => {
    it("should return the correct revision number", () => {
      expect(revision(group)).toBe(5);
    });
  });

  describe("transactions function", () => {
    it("should return the correct transactions", () => {
      expect(transactions(group).length).toBe(1);
      expect(transactions(group)[0][0]).toBe("Dinner");
    });
  });

  describe("agents function", () => {
    it("should return the correct agents", () => {
      expect(agents(group).length).toBe(2);
      expect(agents(group)[0][1]).toBe("Bob");
      expect(agents(group)[1][1]).toBe("Charlie");
    });
  });

  describe("groupId function", () => {
    it("should return the correct group identifier", () => {
      expect(groupId(group)).toEqual(["Test Group", 1672500000000]);
    });
  });
});
