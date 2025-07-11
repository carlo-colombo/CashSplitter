import { Group } from "../model/Group.ts";

/**
 * Storage interface for dependency injection
 */
export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  readonly length: number;
  key(index: number): string | null;
}

/**
 * Service to handle storing and retrieving groups from localStorage
 * For UI testing, we'll use a simplified JSON serialization approach
 */
export class GroupStorage {
  private readonly keyPrefix = "cashsplitter_group_";
  private storage: Storage;
  
  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }
  
  /**
   * Save a group to localStorage
   */
  saveGroup(group: Group): void {
    // Get key components from the group
    const description = group[3];
    const timestamp = group[4];
    const key = `${this.keyPrefix}${description}_${timestamp}`;
    
    console.log("[GroupStorage] Saving group with key:", key);
    
    try {
      // Use JSON for serialization for UI testing purposes
      const jsonData = JSON.stringify(group);
      console.log("[GroupStorage] JSON data:", jsonData.substring(0, 50) + "...");
      
      // Debug storage type
      console.log("[GroupStorage] storage type:", typeof this.storage);
      
      this.storage.setItem(key, jsonData);
      console.log("[GroupStorage] Group saved successfully");
    } catch (error) {
      console.error("Failed to save group to localStorage:", error);
      throw new Error("Failed to save group");
    }
  }
  
  /**
   * Get a group from localStorage by description and timestamp
   * @returns The group or null if not found
   */
  getGroup(description: string, timestamp: number): Group | null {
    const key = `${this.keyPrefix}${description}_${timestamp}`;
    
    try {
      const jsonGroup = this.storage.getItem(key);
      if (!jsonGroup) {
        return null;
      }
      
      return JSON.parse(jsonGroup) as Group;
    } catch (error) {
      console.error("Failed to retrieve group from localStorage:", error);
      return null;
    }
  }
  
  /**
   * Get all groups from localStorage
   */
  getAllGroups(): Group[] {
    const groups: Group[] = [];
    
    try {
      // Loop through all keys in storage
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        
        // Check if the key is for a cashsplitter group
        if (key && key.startsWith(this.keyPrefix)) {
          const jsonGroup = this.storage.getItem(key);
          if (jsonGroup) {
            try {
              const group = JSON.parse(jsonGroup) as Group;
              groups.push(group);
            } catch (error) {
              console.error(`Failed to decode group with key ${key}:`, error);
            }
          }
        }
      }
      
      return groups;
    } catch (error) {
      console.error("Failed to retrieve all groups:", error);
      return [];
    }
  }
  
  /**
   * Delete a group from localStorage
   */
  deleteGroup(description: string, timestamp: number): void {
    const key = `${this.keyPrefix}${description}_${timestamp}`;
    this.storage.removeItem(key);
  }
  
  /**
   * Clear all groups from localStorage (for testing purposes)
   */
  clearAll(): void {
    const keysToRemove: string[] = [];
    
    // Collect all keys to remove
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove them all
    keysToRemove.forEach(key => this.storage.removeItem(key));
  }
}
