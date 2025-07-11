/** @jsx h */
import { h, Component } from "preact";
import { useState } from "preact/hooks";

/**
 * Props for the GroupForm component
 */
interface GroupFormProps {
  onSubmit: (data: { name: string; people: string[] }) => void;
}

/**
 * Component for creating a new group
 */
export function GroupForm({ onSubmit }: GroupFormProps) {
  const [groupName, setGroupName] = useState("");
  const [personName, setPersonName] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  
  /**
   * Handle adding a person to the list
   */
  const handleAddPerson = () => {
    if (personName.trim()) {
      setPeople([...people, personName.trim()]);
      setPersonName("");
    }
  };
  
  /**
   * Handle removing a person from the list
   */
  const handleRemovePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (groupName.trim() && people.length > 0) {
      onSubmit({
        name: groupName.trim(),
        people,
      });
      
      // Reset the form
      setGroupName("");
      setPeople([]);
    }
  };
  
  return (
    <div class="group-form">
      <h2>Create a New Group</h2>
      
      <form onSubmit={handleSubmit}>
        <div class="form-group">
          <label for="group-name">Group Name</label>
          <input
            id="group-name"
            type="text"
            value={groupName}
            onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="person-name">Person Name</label>
          <div class="person-input">
            <input
              id="person-name"
              type="text"
              value={personName}
              onInput={(e) => setPersonName((e.target as HTMLInputElement).value)}
            />
            <button
              type="button"
              onClick={handleAddPerson}
              disabled={!personName.trim()}
            >
              Add Person
            </button>
          </div>
        </div>
        
        {people.length > 0 && (
          <div class="people-list">
            <h3>People in this Group</h3>
            <ul>
              {people.map((person, index) => (
                <li key={index}>
                  {person}
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div class="form-actions">
          <button
            type="submit"
            disabled={!groupName.trim() || people.length === 0}
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
}
