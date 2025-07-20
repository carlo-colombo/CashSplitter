// This file creates a polyfill for Buffer in browser environments
// It's loaded before any other code to ensure Buffer is available

// Only create the polyfill if Buffer doesn't exist
if (typeof Buffer === 'undefined') {
  // @ts-ignore - intentionally adding to global
  self.Buffer = class BufferPolyfill extends Uint8Array {
    // Additional properties and static methods for compatibility
    static isBuffer(obj: unknown): boolean {
      return obj instanceof BufferPolyfill;
    }
    
    // Implement basic Buffer.from functionality
    static from(value: string | ArrayBufferLike | ArrayLike<number>, encodingOrOffset?: string | number, length?: number): BufferPolyfill {
      if (typeof value === 'string') {
        // Convert string to bytes
        const encoder = new TextEncoder();
        const bytes = encoder.encode(value);
        return new BufferPolyfill(bytes);
      } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        return new BufferPolyfill(value);
      } else if (Array.isArray(value)) {
        return new BufferPolyfill(value);
      }
      
      throw new Error('Unsupported type in Buffer.from');
    }
    
    // Implement basic Buffer.alloc functionality
    static alloc(size: number): BufferPolyfill {
      return new BufferPolyfill(size);
    }
    
    // Implement write method
    write(string: string, offset = 0): number {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(string);
      this.set(bytes, offset);
      return bytes.length;
    }
    
    // Implement toString method
    toString(encoding = 'utf8', start = 0, end = this.length): string {
      if (encoding !== 'utf8' && encoding !== 'utf-8') {
        console.warn(`Encoding '${encoding}' is not supported in Buffer polyfill`);
      }
      const bytes = this.slice(start, end);
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    }
  };
  
  console.info('Buffer polyfill created for browser environment');
}
