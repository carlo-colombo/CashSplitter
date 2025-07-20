// Browser-compatible bencode implementation
// This is a simplified bencode encoder/decoder that works in browser environments
// without requiring Node.js Buffer

// Define allowed data types for bencode
type BencodeValue = string | number | Uint8Array | BencodeArray | BencodeDict;
type BencodeArray = BencodeValue[];
interface BencodeDict {
  [key: string]: BencodeValue;
}

/**
 * Simple bencode encoder for browser environments
 * @param data Data to encode
 * @returns Encoded data as Uint8Array
 */
export function encode(data: unknown): Uint8Array {
  const encoder = new TextEncoder();
  
  // Convert the data to bencode format string
  const bencodeString = toBencodeString(data);
  
  // Convert to bytes
  return encoder.encode(bencodeString);
}

/**
 * Simple bencode decoder for browser environments
 * @param data Data to decode
 * @returns Decoded data
 */
export function decode(data: Uint8Array): unknown {
  const decoder = new TextDecoder();
  const text = decoder.decode(data);
  
  // Parse the bencode string
  const [result, _] = parseBencode(text, 0);
  return result;
}

/**
 * Convert a value to bencode string format
 */
function toBencodeString(data: unknown): string {
  if (typeof data === "string") {
    return `${data.length}:${data}`;
  } 
  
  if (typeof data === "number" && Number.isInteger(data)) {
    return `i${data}e`;
  }
  
  if (data instanceof Uint8Array) {
    // Treat as a string of bytes
    return `${data.length}:${String.fromCharCode(...data)}`;
  }
  
  if (Array.isArray(data)) {
    let result = "l";
    for (const item of data) {
      result += toBencodeString(item);
    }
    result += "e";
    return result;
  }
  
  if (data && typeof data === "object" && data !== null) {
    // It's a dictionary/object
    const entries = Object.entries(data as Record<string, unknown>)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    let result = "d";
    for (const [key, value] of entries) {
      result += toBencodeString(key);
      result += toBencodeString(value);
    }
    result += "e";
    return result;
  }
  
  throw new Error(`Cannot encode value of type ${typeof data}`);
}

/**
 * Parse a bencode string into JavaScript values
 * Returns [parsed value, ending position]
 */
function parseBencode(text: string, pos: number): [unknown, number] {
  const char = text[pos];
  
  // String
  if (char >= "0" && char <= "9") {
    // Find the colon separator
    const colonPos = text.indexOf(":", pos);
    if (colonPos === -1) {
      throw new Error("Invalid bencode string format");
    }
    
    // Parse the length
    const length = parseInt(text.substring(pos, colonPos), 10);
    
    // Extract the string
    const startPos = colonPos + 1;
    const endPos = startPos + length;
    const value = text.substring(startPos, endPos);
    
    return [value, endPos];
  }
  
  // Integer
  if (char === "i") {
    const endPos = text.indexOf("e", pos);
    if (endPos === -1) {
      throw new Error("Invalid bencode integer format");
    }
    
    const value = parseInt(text.substring(pos + 1, endPos), 10);
    return [value, endPos + 1];
  }
  
  // List
  if (char === "l") {
    const result: unknown[] = [];
    let currPos = pos + 1;
    
    while (currPos < text.length && text[currPos] !== "e") {
      const [item, newPos] = parseBencode(text, currPos);
      result.push(item);
      currPos = newPos;
    }
    
    if (currPos >= text.length || text[currPos] !== "e") {
      throw new Error("Invalid bencode list format");
    }
    
    return [result, currPos + 1];
  }
  
  // Dictionary
  if (char === "d") {
    const result: Record<string, unknown> = {};
    let currPos = pos + 1;
    
    while (currPos < text.length && text[currPos] !== "e") {
      // Parse key (must be a string)
      const [key, keyEndPos] = parseBencode(text, currPos);
      if (typeof key !== "string") {
        throw new Error("Dictionary keys must be strings");
      }
      
      // Parse value
      const [value, valueEndPos] = parseBencode(text, keyEndPos);
      result[key] = value;
      
      currPos = valueEndPos;
    }
    
    if (currPos >= text.length || text[currPos] !== "e") {
      throw new Error("Invalid bencode dictionary format");
    }
    
    return [result, currPos + 1];
  }
  
  throw new Error(`Unknown bencode type at position ${pos}: ${char}`);
}

// Export a browser-compatible version of bencode
export default {
  encode,
  decode
};
