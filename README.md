# Cashsplitter 

Cashsplitter is a tool to help manages expenses when in group of people. 


## Tech

Cashsplitter is a SPA, built with Preact in typescript, using deno for testing and support scripts.

## Antifeature

* Manage actual payments, it only bookkeep transactions between the people in the group
* Being universal, transaction amount due or owed are scoped to a group
* Storing state in a server

## Development

* Run `deno task build` to build the application in the build directory
* Run `deno task bundle` to directly bundle the TypeScript/JSX into a single JS file
* Run `deno task serve` to start the development server
* Open `http://localhost:8000` in your browser to see the application

## Code structure

* .ai/ --> ai instructions
* build/ --> output file from build scripts
* scripts/ --> support scripts for development and CI
* src/ --> source code
* static/ --> static files as css html and similar