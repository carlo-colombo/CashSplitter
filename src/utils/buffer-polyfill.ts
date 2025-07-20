// Buffer polyfill for browser environments
// This module initializes the Buffer polyfill from the Feross buffer package
import { Buffer } from "buffer";

// Make Buffer available globally
// @ts-ignore - intentionally adding to global
globalThis.Buffer = Buffer;

// Export Buffer for direct usage if needed
export { Buffer };

// This module doesn't need to export anything else as it's primarily used for its side effects
export default Buffer;
