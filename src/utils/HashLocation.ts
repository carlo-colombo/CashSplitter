// This file is no longer needed as we're using wouter's built-in hash location
// Kept for reference purposes

// import { useCallback, useEffect, useState } from "preact/hooks";

// // Get the hash from the URL, removing the leading #
// const currentLoc = () => globalThis.location.hash.replace(/^#/, "") || "/";

// // Create a custom hook for hash-based location
// export const useHashLocation = () => {
//   const [loc, setLoc] = useState(currentLoc());
  
//   useEffect(() => {
//     // Update the state when the hash changes
//     const handler = () => setLoc(currentLoc());
//     globalThis.addEventListener("hashchange", handler);
//     return () => globalThis.removeEventListener("hashchange", handler);
//   }, []);
  
//   // Navigate to a new location by changing the hash
//   const navigate = useCallback(
//     (to: string) => {
//       globalThis.location.hash = to;
//     },
//     []
//   );
  
//   return [loc, navigate] as const;
// };
