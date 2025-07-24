# Copilot Instructions for CashSplitter

## Project Overview

CashSplitter is a lightweight, offline-first expense splitting SPA built with
Preact, TypeScript, and Deno. All data persists to browser localStorage with no
backend server required.

## Architecture Essentials

### Core Data Structure

Groups use a tuple-based format for efficient serialization:
`["cs", 1, revision, description, timestamp, agents[], transactions[]]`. See
`src/model/Group.ts` for the complete type definition.

### State Management Pattern

- Global state via React Context (`src/context/GroupsContext.tsx`)
- Local storage as the single source of truth (`src/storage/GroupStorage.ts`)
- Merge conflict resolution for concurrent edits (`src/merge/merge.ts`)

### Routing & Navigation

Uses hash-based routing with `wouter-preact`. Routes follow pattern:

- `/` - Home (group list)
- `/create` - Create new group
- `/group/:timestamp` - Group details
- `/group/:timestamp/addExpense` - Add expense form

## Development Workflow

### TDD Requirements

**CRITICAL**: Follow strict TDD for all production code:

1. Write failing test first
2. Make test pass with minimal code
3. Refactor while keeping tests green
4. Get user confirmation before proceeding to next step

Skip TDD only for styles or build scripts.

### Key Commands

```bash
deno task build    # Bundle for production (copies static/, bundles src/)
deno task serve    # Local development server
deno task test     # Run all tests
deno fmt          # Format code (enforced in CI)
```

### Component Testing Setup

Components require JSDOM setup via `src/test-utils/component-testing.ts`. Always
test with proper context providers:

```tsx
const { container } = render(
  <NotificationProvider>
    <GroupsProvider>
      <YourComponent />
    </GroupsProvider>
  </NotificationProvider>,
);
```

## Project-Specific Patterns

### Buffer Polyfill Requirement

Import `src/utils/buffer-polyfill.ts` first in entry point for binary data
handling in browsers.

### Notification System

Use `NotificationContext` for user feedback. Components should show
success/error states via `showNotification()`.

### Group Operations

- Creation: `createGroup()` function in `src/model/CreateGroup.ts`
- Persistence: Always use `GroupStorage.ts` functions, never directly access
  localStorage
- Conflicts: Handle `MergeConflictError` from merge operations

### File Organization

- Models: Pure functions in `src/model/` (Group, Expense, Balance, etc.)
- Components: UI components in `src/components/`
- Routes: Page-level components in `src/routes/`
- Storage: Persistence layer in `src/storage/`

## Critical Integration Points

### Serialization

Groups use bencode for compact binary serialization. Import/export via
`src/model/GroupSerialization.ts`.

### Merge Resolution

The app supports offline-first concurrent editing. When loading groups, handle
potential `MergeConflictError` and implement resolution UI.

### Mobile-First Design

Uses Bulma.io framework. Components should work on mobile first, with desktop
enhancements.

## TODO Workflow

Implement ONE TODO item at a time. Update `TODO.md` as work progresses. Check
tests pass before moving to next item.
