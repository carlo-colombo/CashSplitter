## TODO

- [x] SPA setup
  - [x] Create basic project structure with Preact and TypeScript
  - [x] Set up build pipeline with Deno
  - [x] Add basic routing system
    - [x] Implement hash-based routing with wouter
  - [x] Create layout component structure
  - [ ] Set up CSS styling approach (e.g., CSS modules, Tailwind)
  - [x] Create initial app shell
- [x] Set up CI/CD with GitHub Actions
- [x] Set up development tools
  - [x] Implement pre-commit git hooks for deno fmt and lint
  - [x] Add fmt and lint tasks to deno.json
  - [x] Update README with code quality documentation
- [x] Create a group API
- [x] Implement group serialization and deserialization
- [x] Implement merge functionality for group changes
- [x] UI to create a group
  - [x] Create CreateGroup route component
  - [x] Design form for group creation (description field)
  - [x] Implement form submission and group creation
  - [x] Add navigation from Home to CreateGroup and back
  - [x] Add success feedback after group creation
- [x] State is persisted in local storage
  - [x] Create a storage service for groups
  - [x] Implement save/load functionality for groups
  - [x] Update UI components to use storage service
  - [x] Add group listing page
  - [x] Add group detail view
  - [x] Fix browser compatibility issues (Feross Buffer polyfill)
  - [x] Fix React hooks compatibility issue (Switch to wouter-preact)
- [x] Set up component testing infrastructure
  - [x] Add JSDOM and testing utilities for Preact components
  - [x] Create test helper functions for component rendering
  - [x] Add mock utilities for contexts and dependencies
- [ ] Component tests (TDD approach)
  - [x] Notification component tests (basic rendering and click handlers)
  - [ ] Fix auto-dismiss timer tests in JSDOM environment
  - [ ] GroupsList component tests (in progress - mocking wouter-preact
        navigation)
  - [ ] App component tests
  - [ ] Route component tests
- [ ] Add participants API
  - [x] Update createGroup function to accept participants parameter (TDD)
  - [x] Update CreateGroup UI to include participants form (TDD)
  - [ ] Add form validation for participants
  - [ ] Update README to reflect participants in group creation
- [x] Add expense API
  - [x] Implement addExpense function that splits expenses equally among group
        members
  - [x] Add support for subset expense sharing (specify which members
        participate)
  - [x] Add support for custom expense splits (specify custom amounts per
        participant)
  - [x] Make participants and customSplits always required parameters (explicit
        API)
  - [x] Allow payee to not participate in expense splits (payee pays, others
        owe)
  - [x] Handle floating point input (2 decimals) and integer storage (cents)
  - [x] Add comprehensive tests for expense splitting logic
  - [x] Add validation that custom splits sum to expense amount
  - [x] and expense can be payed by multiple participants
- [x] UI to add expenses
  - [x] Create AddExpense component with form validation
  - [x] Add route /group/:timestamp/addExpense
  - [x] Implement form with amount, description, payer dropdown, and participant
        checkboxes
  - [x] Add form validation (amount > 0, payer selected, at least 1 participant)
  - [x] Integrate with existing expense API for equal splitting
  - [x] Add navigation from GroupDetail to AddExpense
  - [x] Add success feedback and navigation back to group after expense creation
  - [x] Write component tests following TDD approach
- [ ] UI to add participants
- [ ] Share a link with the current state of the group
- [ ] Application works offline
