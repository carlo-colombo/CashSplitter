// scripts/compare_group2_serialization.ts
// Compare Bencode vs CBOR serialization lengths for a real Group2 example
// Usage: deno run --allow-net scripts/compare_group2_serialization.ts

import bencode from "npm:bencode";
import cbor from "npm:cbor";
import LZString from "npm:lz-string";
import { GroupOperation } from "../src/model/Group.ts";

// Generate 15 users
const users = Array.from(
  { length: 15 },
  (_, i) => [1, i + 1, `User${i + 1}`] as GroupOperation,
);

// Helper to generate transactions with different timestamp formats

function makeTransactions(
  timestampType: "millis" | "seconds" | "string" | "delta",
  flattenMovements = false,
): GroupOperation[] {
  const base = timestampType === "millis"
    ? 1672500000000
    : Math.floor(1672500000000 / 1000);
  const step = timestampType === "millis" ? 86400000 : 86400;
  return Array.from({ length: 50 }, (_, i) => {
    const desc = `Tx${i + 1} - ${"A".repeat(20 - (`Tx${i + 1} - `.length))}`;
    let timestamp: number | string;
    if (timestampType === "millis") {
      timestamp = 1672500000000 + i * 86400000;
    } else if (timestampType === "seconds") {
      timestamp = Math.floor((1672500000000 + i * 86400000) / 1000);
    } else if (timestampType === "string") {
      timestamp = String(Math.floor((1672500000000 + i * 86400000) / 1000));
    } else if (timestampType === "delta") {
      timestamp = i === 0 ? base : step;
    }
    let movements;
    if (flattenMovements) {
      // Flattened: [id1, amt1, id2, amt2, ...]
      movements = Array.from(
        { length: 15 },
        (_, j) => [j + 1, Math.floor(Math.random() * 100) - 50],
      ).flat();
    } else {
      movements = Array.from(
        { length: 15 },
        (_, j) => [j + 1, Math.floor(Math.random() * 100) - 50],
      );
    }
    return [3, desc, timestamp, movements] as GroupOperation;
  });
}
// Delta-encoded, flattened movements
const txDeltaFlat = makeTransactions("delta", true);
const groupDeltaFlat: ["cs", 2, number, string, number, Array<GroupOperation>] =
  [
    "cs",
    2,
    1,
    "Large Test Group",
    Math.floor(1672500000000 / 1000),
    [
      ...users,
      ...txDeltaFlat,
    ],
  ];
const bencodedDeltaFlat = bencode.encode(groupDeltaFlat);
const cborEncodedDeltaFlat = cbor.encode(groupDeltaFlat);

// Delta-encoded timestamps (seconds)
const txDelta = makeTransactions("delta");
// Store base timestamp in group, then deltas in transactions
const groupDelta: ["cs", 2, number, string, number, Array<GroupOperation>] = [
  "cs",
  2,
  1,
  "Large Test Group",
  Math.floor(1672500000000 / 1000), // base timestamp
  [
    ...users,
    ...txDelta,
  ],
];
const bencodedDelta = bencode.encode(groupDelta);
const cborEncodedDelta = cbor.encode(groupDelta);

function makeGroup2(
  transactions: GroupOperation[],
  timestamp: number | string,
): [
  "cs",
  2,
  number,
  string,
  number | string,
  Array<GroupOperation>,
] {
  return [
    "cs",
    2,
    1,
    "Large Test Group",
    timestamp,
    [
      ...users,
      ...transactions,
    ],
  ];
}

// Milliseconds
const txMillis = makeTransactions("millis");
const groupMillis = makeGroup2(txMillis, 1672500000000);
const bencodedMillis = bencode.encode(groupMillis);
const cborEncodedMillis = cbor.encode(groupMillis);

// Seconds
const txSeconds = makeTransactions("seconds");
const groupSeconds = makeGroup2(txSeconds, Math.floor(1672500000000 / 1000));
const bencodedSeconds = bencode.encode(groupSeconds);
const cborEncodedSeconds = cbor.encode(groupSeconds);

// String seconds
const txString = makeTransactions("string");
const groupString = makeGroup2(
  txString,
  String(Math.floor(1672500000000 / 1000)),
);
const bencodedString = bencode.encode(groupString);
const cborEncodedString = cbor.encode(groupString);

console.log("--- Timestamp in milliseconds (number) ---");
console.log(`Bencode length: ${bencodedMillis.length}`);
console.log(`CBOR length: ${cborEncodedMillis.length}`);

console.log("--- Timestamp in seconds (number) ---");
console.log(`Bencode length: ${bencodedSeconds.length}`);
console.log(`CBOR length: ${cborEncodedSeconds.length}`);

console.log("--- Timestamp in seconds (string) ---");
console.log(`Bencode length: ${bencodedString.length}`);
console.log(`CBOR length: ${cborEncodedString.length}`);

console.log("--- Timestamp as delta (seconds) ---");
console.log(`Bencode length: ${bencodedDelta.length}`);
console.log(`CBOR length: ${cborEncodedDelta.length}`);

// Compression using lz-string (browser-compatible, base64)
function compressAndReport(label: string, buf: Uint8Array) {
  // Convert to string for lz-string (UTF-16 safe)
  const str = String.fromCharCode(...buf);
  const compressed = LZString.compressToBase64(str);
  // base64url: replace +/ with -_ and remove =
  const base64url = compressed.replace(/\+/g, "-").replace(/\//g, "_").replace(
    /=+$/,
    "",
  );
  console.log(
    `${label} compressed (lz-string base64url): ${base64url.length} chars`,
  );
}

compressAndReport("Bencode millis", bencodedMillis);
compressAndReport("CBOR millis", cborEncodedMillis);
compressAndReport("Bencode seconds", bencodedSeconds);
compressAndReport("CBOR seconds", cborEncodedSeconds);
compressAndReport("Bencode string", bencodedString);
compressAndReport("CBOR string", cborEncodedString);
compressAndReport("Bencode delta", bencodedDelta);
compressAndReport("CBOR delta", cborEncodedDelta);
compressAndReport("Bencode delta flat", bencodedDeltaFlat);
compressAndReport("CBOR delta flat", cborEncodedDeltaFlat);
