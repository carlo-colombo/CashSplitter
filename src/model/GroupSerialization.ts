import { Group } from "./Group.ts";
// Import bencode from deno.json imports
import bencode from "bencode";

/**
 * Serializes a Group object to a bencode string
 * @param group The Group to serialize
 * @returns String containing the bencoded data
 */
export function encode(group: Group): string {
  // Use bencode library to encode the group
  const encoded = bencode.encode(group);
  
  // Convert to string
  return String.fromCharCode(...encoded);
}

/**
 * Deserializes a bencoded Group object from a string
 * @param str String containing the bencoded data
 * @returns Deserialized Group object
 * @throws Error if the data doesn't represent a valid Group
 */
export function decode(str: string): Group {
  try {
    // Convert string to binary data
    const binaryData = Uint8Array.from(str, c => c.charCodeAt(0));
    
    // Use bencode library to decode the data
    const decoded = bencode.decode(binaryData);
    
    // Process the decoded data
    const processedData = convertBuffersToStrings(decoded);
    
    // Verify it's an array with the right structure
    if (!Array.isArray(processedData) || processedData.length < 7) {
      throw new Error("Invalid group data format: not a valid array");
    }
    
    // Convert the decoded array to a Group
    const group = processedData as unknown[];
    
    // Validate expected types and format
    if (
      typeof group[0] !== "string" || group[0] !== "cs" ||
      typeof group[1] !== "number" || group[1] !== 1 ||
      typeof group[2] !== "number" ||
      typeof group[3] !== "string" ||
      typeof group[4] !== "number" ||
      !Array.isArray(group[5]) ||
      !Array.isArray(group[6])
    ) {
      throw new Error("Invalid group data format: wrong structure");
    }
    
    // Convert agents and transactions if needed
    const agents = (group[5] as unknown[]).map(agent => {
      if (Array.isArray(agent) && agent.length === 2 && 
          typeof agent[0] === "number" && 
          (typeof agent[1] === "string" || 
           (agent[1] && typeof agent[1] === "object"))) {
        return [
          agent[0],
          typeof agent[1] === "string" ? agent[1] : convertToString(agent[1])
        ] as [number, string];
      }
      throw new Error("Invalid agent format");
    });
    
    const transactions = (group[6] as unknown[]).map(transaction => {
      if (Array.isArray(transaction) && transaction.length === 3) {
        const desc = typeof transaction[0] === "string" ? transaction[0] : convertToString(transaction[0]);
        const timestamp = transaction[1] as number;
        
        if (!Array.isArray(transaction[2])) {
          throw new Error("Invalid transaction entries");
        }
        
        const entries = (transaction[2] as unknown[]).map(entry => {
          if (Array.isArray(entry) && entry.length === 2) {
            return [entry[0] as number, entry[1] as number];
          }
          throw new Error("Invalid transaction entry format");
        });
        
        return [desc, timestamp, entries] as [string, number, [number, number][]];
      }
      throw new Error("Invalid transaction format");
    });
    
    // Create the final Group structure
    return [
      "cs", 
      1,
      group[2] as number,
      group[3] as string,
      group[4] as number,
      agents,
      transactions
    ] as Group;
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid group data format") {
      throw error;
    }
    throw new Error("Failed to decode group data");
  }
}

/**
 * Converts any Buffer objects to strings recursively in an object
 */
function convertBuffersToStrings(obj: unknown): unknown {
  // If it's a Buffer/Uint8Array, convert to string
  if (obj && typeof obj === "object" && 
      (Object.prototype.toString.call(obj) === "[object Uint8Array]" ||
       obj.constructor.name === "Buffer")) {
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

/**
 * Helper to convert a value to string if it's a buffer or already a string
 */
function convertToString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  
  if (value && typeof value === "object" && 
      (Object.prototype.toString.call(value) === "[object Uint8Array]" ||
       value.constructor?.name === "Buffer")) {
    return new TextDecoder().decode(value as Uint8Array);
  }
  
  throw new Error(`Cannot convert value to string: ${value}`);
}
