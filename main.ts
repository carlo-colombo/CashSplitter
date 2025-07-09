// Re-export Group type and merge function from their new locations
export type { Group } from "./src/model/Group.ts";
export { merge } from "./src/merge/merge.ts";
// Re-export the constants from Group.ts for backward compatibility
export {
  GROUP_HEADER,
  GROUP_VERSION,
  GROUP_REVISION,
  GROUP_DESCRIPTION,
  GROUP_CREATION_TIMESTAMP,
  GROUP_AGENTS,
  GROUP_TRANSACTIONS
} from "./src/model/Group.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}