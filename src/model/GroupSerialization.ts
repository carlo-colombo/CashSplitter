import { Group } from "./Group.ts";
// Import bencode from deno.json imports
import bencode from "bencode";

/**
 * Serializes a Group object to a bencode string
 * @param group The Group to serialize
 * @returns String containing the bencoded data
 */
export function encode(group: Group): string {
  // Convert group to a structure suitable for bencode serialization
  const serializableGroup = {
    header: group[0],
    version: group[1],
    revision: group[2],
    description: group[3],
    timestamp: group[4],
    agents: group[5],
    transactions: group[6]
  };
  
  // Use bencode library to encode the group
  const encoded = bencode.encode(serializableGroup);
  
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
    
    if (typeof processedData !== "object" || processedData === null) {
      throw new Error("Invalid group data format");
    }
    
    const decodedObj = processedData as Record<string, unknown>;
    
    // Validate the decoded data structure
    if (
      !("header" in decodedObj) ||
      !("version" in decodedObj) ||
      !("revision" in decodedObj) ||
      !("description" in decodedObj) ||
      !("timestamp" in decodedObj) ||
      !("agents" in decodedObj) ||
      !("transactions" in decodedObj)
    ) {
      throw new Error("Invalid group data format");
    }
    
    // Convert back to Group tuple structure
    return [
      convertToString(decodedObj.header) as "cs",
      decodedObj.version as 1,
      decodedObj.revision as number,
      convertToString(decodedObj.description),
      decodedObj.timestamp as number,
      (decodedObj.agents as unknown[]).map(agent => {
        if (Array.isArray(agent) && agent.length === 2) {
          return [agent[0] as number, convertToString(agent[1])];
        }
        throw new Error("Invalid agent format");
      }) as [number, string][],
      (decodedObj.transactions as unknown[]).map(transaction => {
        if (Array.isArray(transaction) && transaction.length === 3) {
          return [
            convertToString(transaction[0]), 
            transaction[1] as number, 
            (transaction[2] as unknown[]).map(entry => {
              if (Array.isArray(entry) && entry.length === 2) {
                return [entry[0] as number, entry[1] as number];
              }
              throw new Error("Invalid transaction entry format");
            }) as [number, number][]
          ];
        }
        throw new Error("Invalid transaction format");
      }) as [string, number, [number, number][]][],
    ];
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
