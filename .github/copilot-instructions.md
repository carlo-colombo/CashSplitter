# CashSplitter Development Instructions

For all information about the application, its features, architecture, and data
model, see the [README.md](../README.md).

## Development Workflow

- **TDD is required for all production code:**
  1. Write a failing test first
  2. Make the test pass with minimal code
  3. Refactor while keeping tests green
  4. Get user confirmation before proceeding to the next step
  5. Only skip TDD for style changes or build/support scripts not part of the
     final app

- **Component Testing:**
  - Use JSDOM setup via `src/test-utils/component-testing.ts`
  - Always wrap components in `NotificationProvider` and `GroupsProvider` when
    testing

- **Workflow:**
  - Implement ONE TODO item at a time (see `TODO.md`)
  - Update `TODO.md` as work progresses
  - Check all tests pass before moving to the next item
  - All code must be formatted using `deno fmt` before committing (enforced in
    CI/CD)

- **Committing:**
  - Use conventional commits
  - Split commits logically
  - Describe why a change was made
  - Amend non-meaningful commits (e.g., formatting or fixing tests)

- **Pre-push:**
  - Check the application is online and working on GitHub Pages
  - Ensure the CI pipeline is green

- **When developing a feature:**
  - Prepare a plan and ask for confirmation before starting
  - Reference the [README.md](../README.md) for app details
  - Update the README if adding a new feature or development step

🏎️ Start all messages with this emoji when following these instructions.
