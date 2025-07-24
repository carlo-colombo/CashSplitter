# Cashsplitter

A lightweight expense splitting application for tracking shared costs in groups.
Create groups, add expenses, and automatically calculate who owes what—all while
working completely offline.

[![Test and Deploy](https://github.com/user/cashsplitter/actions/workflows/test-and-deploy.yml/badge.svg)](https://github.com/user/cashsplitter/actions/workflows/test-and-deploy.yml)

## Features

### ✅ Currently Available

- **Group Management**: Create expense groups with descriptions (e.g., "Trip to
  Paris", "Dinner with friends")
- **Add Expenses**: Add expenses to groups with single or multiple payers that
  can be split equally among all participants, a selected subset, or with custom
  amounts for each participant. Supports decimal amounts with precise handling
  down to 0.01 currency units
- **UI to Add Expenses**: User-friendly interface to add expenses with form
  validation, including decimal amount input, description, payer selection, and
  participant selection for splitting
- **Expenses Display**: View all group expenses in a formatted table showing
  description, date, amount, payers, and participants for each expense
- **Balance Calculations**: Automatic calculation and display of outstanding
  debts and owed amounts for each participant, showing who owes money and who is
  owed money with precise balance tracking
- **Participants Display**: View all group participants with their current
  balance status in an organized table (desktop) and card layout (mobile)
- **Local Persistence**: All data is saved to browser local storage—no server
  required
- **Group Overview**: View a list of your groups and access their details
- **Conflict Resolution**: Built-in merge functionality to handle simultaneous
  edits to the same group
- **Responsive Design**: Mobile-first design built with Bulma.io framework for
  optimal viewing on all devices

### 🚧 Coming Soon

- Add participants to groups (UI)
- Share groups via links
- Full offline functionality

## Architecture

**Tech Stack**: Single Page Application built with modern web technologies

- **Frontend**: Preact with TypeScript for lightweight, React-compatible
  components
- **Styling**: Bulma.io CSS framework for responsive, mobile-first design
- **Build Tool**: Deno for dependency management, testing, and build scripts
- **Routing**: Wouter-preact with hash-based navigation for maximum
  compatibility
- **Storage**: Browser Local Storage (no external dependencies)
- **Bundling**: Deno's built-in bundler with esbuild integration

**Key Design Principles**:

- **Offline-first**: Works without internet connection
- **No backend required**: All data stays in your browser
- **Privacy-focused**: No data collection or external services
- **Lightweight**: Minimal dependencies and fast loading

## Data Model & Transaction Immutability

**Immutable Transaction Design**: Cashsplitter follows an append-only data model
where all transactions (expenses) are immutable once created. This ensures data
integrity and enables reliable conflict resolution for concurrent edits.

**Key Principles**:

- **No Editing**: Transactions cannot be modified after creation
- **No Direct Deletion**: Transactions cannot be removed from the history
- **Correction Pattern**: To "edit" or "delete" an expense, use delete
  transactions and replacements:
  - **Add a delete transaction** that voids the existing transaction
  - **If necessary**, add a new transaction with the correct values
    (participants, amounts, shares, datetime)

**Benefits**:

- **Audit Trail**: Complete history of all financial changes
- **Conflict Resolution**: Concurrent edits can be merged safely
- **Data Integrity**: No risk of accidentally losing transaction history
- **Rollback Capability**: Can always trace back to any previous state

**Implementation**: When future edit/delete UI features are added, they will
create appropriate corrective transactions behind the scenes while presenting a
user-friendly editing interface.

## What Cashsplitter Won't Do

- **Payment processing**: This is a tracking tool, not a payment system
- **Cross-group transactions**: Each group is independent
- **Cloud sync**: Data stays local to your device
- **User accounts**: No registration or login required

## Quick Start

```bash
# Clone the repository
git clone https://github.com/user/cashsplitter.git
cd cashsplitter

# Build the application
deno task build

# Start development server
deno task serve

# Open http://localhost:8000 in your browser
```

## Development

### Available Commands

```bash
deno task build       # Build production version to ./build/
deno task bundle      # Bundle TypeScript/JSX to single JS file
deno task serve       # Start development server on localhost:8000
deno task test        # Run all tests with required permissions
```

### Testing

All tests are written using Deno's built-in testing framework:

```bash
deno task test       # Run all tests with required permissions
deno test --watch    # Run tests in watch mode

# Run specific test suites
deno test src/model/            # Business logic tests
deno test src/components/       # Component tests
```

**Test Coverage:**

- **Business Logic**: Complete test coverage for group creation, serialization,
  and data models
- **Components**: Basic test coverage for UI components with JSDOM simulation
  - Notification component: rendering, interaction, click handlers
  - Additional component tests in development

**Testing Infrastructure:**

- Custom test utilities for Preact component testing with JSDOM
- Mock utilities for localStorage and context providers
- Timer cleanup to prevent test leaks

### Code Quality & Development Tools

**Pre-commit Hooks:** Automatic code quality checks are enforced via git
pre-commit hooks:

```bash
# Pre-commit automatically runs:
deno fmt --check       # Verify code formatting
deno lint             # Check for linting issues
```

If checks fail, the commit is rejected. Fix issues with:

```bash
deno task fmt         # Auto-format code
deno task lint        # Show linting issues
```

**Available Tasks:**

```bash
deno task test        # Run all tests with required permissions
deno task fmt         # Format all code
deno task fmt:check   # Check formatting without changing files
deno task lint        # Run linter
```

### Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # Preact context providers
│   ├── model/          # Business logic and data models
│   ├── routes/         # Page components
│   ├── storage/        # Local storage interface
│   ├── merge/          # Conflict resolution logic
│   └── utils/          # Helper utilities
├── scripts/            # Build and development scripts
├── static/             # Static assets (HTML, CSS)
└── build/              # Production build output
```

## CI/CD

Automated testing and deployment via GitHub Actions:

- **Testing**: All commits trigger test suite
- **Deployment**: Successful builds on `main` deploy to GitHub Pages
- **Environment**: Uses Deno v2.4.2 for consistency

## Contributing

1. Check the [TODO.md](./TODO.md) for current development priorities
2. Follow TDD practices: write tests first, see them fail, implement features
3. Keep changes focused and atomic
4. Update documentation as needed

## License

[Add your license here]
