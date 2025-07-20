# Cashsplitter 

Cashsplitter is a tool to help manage expenses when in a group of people. The app allows users to create groups for tracking shared expenses and easily split costs among participants.

[![Test and Deploy](https://github.com/user/cashsplitter/actions/workflows/test-and-deploy.yml/badge.svg)](https://github.com/user/cashsplitter/actions/workflows/test-and-deploy.yml)

## Features

- Create expense groups with descriptions (e.g., "Trip to Paris", "Dinner with friends")
- Save groups to local storage for persistence between sessions
- View a list of your groups and access their details
- Add participants to your groups
- Record transactions and automatically calculate balances
- Work offline and share groups via links
- Merge changes when multiple people update the same group

## Tech

Cashsplitter is a SPA, built with Preact in TypeScript, using Deno for testing and support scripts.

## Antifeature

* Manage actual payments, it only bookkeep transactions between the people in the group
* Being universal, transaction amount due or owed are scoped to a group
* Storing state in a server

## Development

* Run `deno task build` to build the application in the build directory
* Run `deno task bundle` to directly bundle the TypeScript/JSX into a single JS file
* Run `deno task serve` to start the development server
* Open `http://localhost:8000` in your browser to see the application

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:
* Tests run automatically on all pull requests and pushes to the main branch
* When changes are merged to main, the application is automatically built and deployed to GitHub Pages
* The pipeline uses Deno v2.4.2 for testing and building

## Code structure

* .ai/ --> ai instructions
* build/ --> output file from build scripts
* scripts/ --> support scripts for development and CI
* src/ --> source code
* static/ --> static files as css html and similar