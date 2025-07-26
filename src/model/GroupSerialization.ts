import { Group2 } from "./Group.ts";
// Import the original bencode library (Buffer is now available from the polyfill)
import bencode from "bencode";

/**
 * Serializes a Group2 object to a bencode string
 * @param group The Group2 to serialize
 * @returns String containing the bencoded data
 */
export function encode(group: Group2): string {
  const encoded = bencode.encode(group);
  return String.fromCharCode(...encoded);
}

/**
 * Deserializes a bencoded Group object from a string
 * Deserializes a bencoded Group2 object from a string
 * @param str String containing the bencoded data
 * @returns Deserialized Group2 object
 * @throws Error if the data doesn't represent a valid Group2
 */
export function decode(str: string): Group2 {
  try {
    const binaryData = Uint8Array.from(str, (c) => c.charCodeAt(0));
    const decoded = bencode.decode(binaryData);
    const processedData = convertBuffersToStrings(decoded);
    // Top-level structure validation
    if (!Array.isArray(processedData)) {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    if (processedData.length !== 6) {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    const [header, version, revision, description, timestamp, operations] =
      processedData;
    if (header !== "cs") {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    if (version !== 2) {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    if (typeof revision !== "number") {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    let groupDescription = description;
    if (description instanceof Uint8Array) {
      groupDescription = new TextDecoder().decode(description);
    }
    if (typeof groupDescription !== "string") {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    if (typeof timestamp !== "number") {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    if (!Array.isArray(operations)) {
      throw Object.assign(new Error("Invalid group2 data format"), {
        name: "Group2DecodeError",
      });
    }
    // Defer all other validation to operation-level checks so specific errors can surface
    for (const op of operations) {
      if (!Array.isArray(op)) continue;
      if (op[0] === 1) {
        // AddMember: [1, id, name]
        if (
          op.length !== 3 || typeof op[1] !== "number" ||
          typeof op[2] !== "string"
        ) {
          throw Object.assign(new Error("Invalid agent format"), {
            name: "Group2DecodeError",
          });
        }
      } else if (op[0] === 3) {
        // AddTransaction: [3, description, timestamp, entries]
        // Accept description as string or Uint8Array (binary)
        let desc = op[1];
        if (desc instanceof Uint8Array) {
          desc = new TextDecoder().decode(desc);
          op[1] = desc;
        }
        if (typeof desc !== "string") {
          throw Object.assign(new Error("Invalid transaction format"), {
            name: "Group2DecodeError",
          });
        }
        if (
          op.length !== 4 || typeof op[2] !== "number" || !Array.isArray(op[3])
        ) {
          throw Object.assign(new Error("Invalid transaction format"), {
            name: "Group2DecodeError",
          });
        }
        // Validate transaction entries
        for (const entry of op[3]) {
          if (!Array.isArray(entry) || entry.length !== 2) {
            throw Object.assign(new Error("Invalid transaction entry format"), {
              name: "Group2DecodeError",
            });
          }
          if (typeof entry[0] !== "number" || typeof entry[1] !== "number") {
            throw Object.assign(new Error("Invalid transaction entries"), {
              name: "Group2DecodeError",
            });
          }
        }
      }
    }
    // Return a Group2 object with the decoded string description
    const group2: Group2 = [
      header,
      version,
      revision,
      groupDescription,
      timestamp,
      operations,
    ];
    return group2;
  } catch (error) {
    // Always throw an Error object for test compatibility
    if (
      error instanceof Error && (
        error.message.startsWith("Invalid group2 data format") ||
        error.message.startsWith("Invalid agent format") ||
        error.message.startsWith("Invalid transaction format") ||
        error.message.startsWith("Invalid transaction entries") ||
        error.message.startsWith("Invalid transaction entry format")
      )
    ) {
      // Always rethrow as an Error instance (for test compatibility)
      throw error;
    }
    // For any other error (including non-Error), always throw a new Error with the expected message
    throw new Error("Failed to decode group2 data");
  }
}

/**
 * Converts any Buffer objects to strings recursively in an object
 */
function convertBuffersToStrings(obj: unknown): unknown {
  // If it's a Buffer/Uint8Array, convert to string
  if (
    obj && typeof obj === "object" &&
    (Object.prototype.toString.call(obj) === "[object Uint8Array]" ||
      obj.constructor?.name === "Buffer")
  ) {
    return new TextDecoder().decode(obj as Uint8Array);
  }

  // If it's an array, process each element
  if (Array.isArray(obj)) {
    return obj.map(convertBuffersToStrings);
  }

  // If it's an object, process each property
  if (obj && typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBuffersToStrings(value);
    }
    return result;
  }

  // Otherwise return as is
  return obj;
}
