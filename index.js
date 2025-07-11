// Simple browser-compatible script for Cashsplitter
document.addEventListener('DOMContentLoaded', function() {
  const appDiv = document.getElementById('app');
  
  const mainView = `
    <div class="app">
      <header>
        <h1>Cashsplitter</h1>
        <p>Manage expenses when in groups of people</p>
      </header>
      
      <main>
        <section class="group-list">
          <h2>Your Groups</h2>
          <div id="groups-container">
            <p>No groups yet. Create your first group below.</p>
          </div>
        </section>
        
        <section class="create-group">
          <div class="group-form">
            <h2>Create a New Group</h2>
            
            <form id="group-form">
              <div class="form-group">
                <label for="group-name">Group Name</label>
                <input
                  id="group-name"
                  type="text"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="person-name">Person Name</label>
                <div class="person-input">
                  <input
                    id="person-name"
                    type="text"
                  />
                  <button
                    type="button"
                    id="add-person"
                  >
                    Add Person
                  </button>
                </div>
              </div>
              
              <div class="people-list" id="people-list-container" style="display: none;">
                <h3>People in this Group</h3>
                <ul id="people-list">
                </ul>
              </div>
              
              <div class="form-actions">
                <button
                  type="submit"
                  id="create-group-btn"
                  disabled
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  `;
  
  appDiv.innerHTML = mainView;
  
  // DOM elements
  const groupNameInput = document.getElementById('group-name');
  const personNameInput = document.getElementById('person-name');
  const addPersonButton = document.getElementById('add-person');
  const peopleListContainer = document.getElementById('people-list-container');
  const peopleList = document.getElementById('people-list');
  const createGroupButton = document.getElementById('create-group-btn');
  const groupForm = document.getElementById('group-form');
  const groupsContainer = document.getElementById('groups-container');
  
  // Store people
  const people = [];
  
  // Local storage key prefix
  const STORAGE_PREFIX = 'cashsplitter_group_';
  
  // Load saved groups
  loadGroups();
  
  // Event listeners
  groupNameInput.addEventListener('input', validateForm);
  addPersonButton.addEventListener('click', addPerson);
  groupForm.addEventListener('submit', createGroup);
  
  // Function to add a person
  function addPerson() {
    const name = personNameInput.value.trim();
    
    if (name) {
      people.push(name);
      personNameInput.value = '';
      
      // Show the people list if hidden
      peopleListContainer.style.display = 'block';
      
      // Add to the list
      const li = document.createElement('li');
      li.innerHTML = `
        ${name}
        <button type="button" class="remove-person" data-index="${people.length - 1}">Remove</button>
      `;
      peopleList.appendChild(li);
      
      // Add remove event
      const removeButton = li.querySelector('.remove-person');
      removeButton.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        people.splice(index, 1);
        li.remove();
        
        // Re-index the remaining remove buttons
        document.querySelectorAll('.remove-person').forEach((button, i) => {
          button.setAttribute('data-index', i);
        });
        
        // Hide list if empty
        if (people.length === 0) {
          peopleListContainer.style.display = 'none';
        }
        
        validateForm();
      });
      
      validateForm();
    }
  }
  
  // Validate the form
  function validateForm() {
    const groupName = groupNameInput.value.trim();
    createGroupButton.disabled = !(groupName && people.length > 0);
  }
  
  // Create a new group
  function createGroup(e) {
    e.preventDefault();
    
    const groupName = groupNameInput.value.trim();
    
    if (groupName && people.length > 0) {
      const timestamp = Date.now();
      
      // Create the group
      const group = {
        header: "cs",
        version: 1,
        revision: 1,
        description: groupName,
        timestamp: timestamp,
        agents: people.map((name, index) => [index + 1, name]),
        transactions: []
      };
      
      // Save to localStorage
      saveGroup(group);
      
      // Reset form
      groupNameInput.value = '';
      people.length = 0;
      peopleList.innerHTML = '';
      peopleListContainer.style.display = 'none';
      
      // Refresh groups list
      loadGroups();
      
      // Disable create button
      createGroupButton.disabled = true;
    }
  }
  
  // Save group to localStorage
  function saveGroup(group) {
    const key = `${STORAGE_PREFIX}${group.description}_${group.timestamp}`;
    localStorage.setItem(key, JSON.stringify([
      group.header,
      group.version,
      group.revision,
      group.description,
      group.timestamp,
      group.agents,
      group.transactions
    ]));
  }
  
  // Load all groups from localStorage
  function loadGroups() {
    const groups = [];
    
    // Get all keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const groupData = JSON.parse(localStorage.getItem(key));
          groups.push(groupData);
        } catch (error) {
          console.error(`Failed to parse group with key ${key}:`, error);
        }
      }
    }
    
    // Display the groups
    displayGroups(groups);
  }
  
  // Display the list of groups
  function displayGroups(groups) {
    if (groups.length === 0) {
      groupsContainer.innerHTML = '<p>No groups yet. Create your first group below.</p>';
      return;
    }
    
    const ul = document.createElement('ul');
    
    groups.forEach(group => {
      const li = document.createElement('li');
      li.innerHTML = `
        <h3>${group[3]}</h3>
        <p>${group[5].length} people</p>
        <div class="actions">
          <button class="view-group" data-description="${group[3]}" data-timestamp="${group[4]}">View Details</button>
          <button class="delete-group" data-description="${group[3]}" data-timestamp="${group[4]}">Delete</button>
        </div>
      `;
      ul.appendChild(li);
      
      // Add delete event
      const deleteButton = li.querySelector('.delete-group');
      deleteButton.addEventListener('click', function() {
        const description = this.getAttribute('data-description');
        const timestamp = parseInt(this.getAttribute('data-timestamp'));
        deleteGroup(description, timestamp);
      });
    });
    
    groupsContainer.innerHTML = '';
    groupsContainer.appendChild(ul);
  }
  
  // Delete a group
  function deleteGroup(description, timestamp) {
    const key = `${STORAGE_PREFIX}${description}_${timestamp}`;
    localStorage.removeItem(key);
    
    // Refresh the groups list
    loadGroups();
  }
});
