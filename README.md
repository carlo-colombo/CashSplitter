# Cashsplitter

A lightweight expense splitting application for tracking shared costs in groups. Create groups, add expenses, and automatically calculate who owes what—all while working completely offline.

[![Test and Deploy](https://github.com/user/cashsplitter/actions/workflows/test-and-deploy.yml/badge.svg)](https://github.com/user/cashsplitter/actions/workflows/test-and-deploy.yml)

## Features

### ✅ Currently Available
- **Group Management**: Create expense groups with descriptions (e.g., "Trip to Paris", "Dinner with friends")
- **Local Persistence**: All data is saved to browser local storage—no server required
- **Group Overview**: View a list of your groups and access their details
- **Conflict Resolution**: Built-in merge functionality to handle simultaneous edits to the same group

### 🚧 Coming Soon
- Add participants to groups
- Record and split transactions between participants
- Share groups via links
- Full offline functionality
- Automatic balance calculations

## Architecture

**Tech Stack**: Single Page Application built with modern web technologies
- **Frontend**: Preact with TypeScript for lightweight, React-compatible components
- **Build Tool**: Deno for dependency management, testing, and build scripts
- **Routing**: Wouter with hash-based navigation for maximum compatibility
- **Storage**: Browser Local Storage (no external dependencies)
- **Bundling**: Deno's built-in bundler with esbuild integration

**Key Design Principles**:
- **Offline-first**: Works without internet connection
- **No backend required**: All data stays in your browser
- **Privacy-focused**: No data collection or external services
- **Lightweight**: Minimal dependencies and fast loading

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
```

### Testing
All tests are written using Deno's built-in testing framework:
```bash
deno test            # Run all tests
deno test --watch    # Run tests in watch mode
```

### Project Structure
```
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
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
