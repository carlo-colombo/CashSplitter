/** @jsx h */
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { GroupForm } from "./components/GroupForm.tsx";
import { GroupStorage } from "./storage/GroupStorage.ts";
import { Group } from "./model/Group.ts";

// We need a proper TypeScript definition for Preact JSX
declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Type for HTML elements
declare global {
  interface HTMLInputElement extends HTMLElement {
    value: string;
  }
  interface Event {
    target: EventTarget | null;
  }
  interface EventTarget {
    value?: string;
  }
}

/**
 * Creates a new Group structure based on form input
 */
function createGroupFromForm(name: string, people: string[]): Group {
  const timestamp = Date.now();
  
  // Create the group with all required fields
  const group: Group = [
    "cs",                 // Header
    1,                    // Version
    1,                    // Revision
    name,                 // Group Description
    timestamp,            // Creation timestamp
    [],                   // Agents (empty initially)
    []                    // Transactions (empty initially)
  ];
  
  // Add people as agents
  const agents = people.map((name, index) => [index + 1, name] as [number, string]);
  group[5] = agents;
  
  return group;
}

/**
 * Main application component
 */
export function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const storage = new GroupStorage();
  
  // Load groups on initial render
  useEffect(() => {
    const storedGroups = storage.getAllGroups();
    setGroups(storedGroups);
  }, []);
  
  // Set up online/offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);
    
    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  /**
   * Handle creating a new group
   */
  const handleCreateGroup = (data: { name: string; people: string[] }) => {
    // Create a new group from form data
    const newGroup = createGroupFromForm(data.name, data.people);
    
    // Save to storage
    storage.saveGroup(newGroup);
    
    // Update state
    setGroups([...groups, newGroup]);
  };
  
  /**
   * Handle deleting a group
   */
  const handleDeleteGroup = (description: string, timestamp: number) => {
    // Delete from storage
    storage.deleteGroup(description, timestamp);
    
    // Update state
    setGroups(groups.filter(group => group[3] !== description || group[4] !== timestamp));
  };
  
  return (
    <div class="app">
      <header>
        <h1>Cashsplitter</h1>
        <p>Manage expenses when in groups of people</p>
        {!isOnline && (
          <div class="offline-indicator">
            You're currently offline. Your changes will be saved locally.
          </div>
        )}
      </header>
      
      <main>
        <section class="group-list">
          <h2>Your Groups</h2>
          {groups.length === 0 ? (
            <p>No groups yet. Create your first group below.</p>
          ) : (
            <ul>
              {groups.map((group) => (
                <li key={`${group[3]}_${group[4]}`}>
                  <h3>{group[3]}</h3>
                  <p>{group[5].length} people</p>
                  <div class="actions">
                    <button type="button">View Details</button>
                    <button 
                      type="button"
                      onClick={() => handleDeleteGroup(group[3], group[4])}
                      class="delete"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        
        <section class="create-group">
          <GroupForm onSubmit={handleCreateGroup} />
        </section>
      </main>
    </div>
  );
}
