# Cashsplitter 

Cashsplitter is a tool to help manages expenses when in group of people. 

## TODO

* [x] Create a group
* [ ] Add partecipants
* [ ] State is persisted in local storage
* [ ] Add a transaction that coinvolge 1 or more partecipants
* [ ] Share a link with the current state of the group
* [ ] Merge changes from a group after diverged
* [ ] Application works offline

## Tech

Cashsplitter is a SPA, built with Preact in typescript, using deno for testing and support scripts.

## Antifeature

* Manage actual payments, it only bookkeep transactions between the people in the group
* Being universal, transaction amount due or owed are scoped to a group
* Storing state in a server

## Development

* Run `deno task build` build the application in the build directory

## Code structure

* .ai/ --> ai instructions
* build/ --> output file from build scripts
* scripts/ --> support scripts for development and CI
* src/ --> source code
* static/ --> static files as css html and similar