# Cashsplitter 

Cashsplitter is a tool to help manages expenses when in group of people. 

1. Create a group, and add people to it
2. Add transactions to the group
3. Share the current state of the group

## Features

* Allows merging of the state of the group after diverging
* Stats about the group expenses


## Antifeature

* Manage actual payments, it only bookkeep transactions between the people in the group
* Being universal, transaction amount due or owed are scoped to a group

## Code structure

* .ai/ --> ai instructions
* build/ --> output file from build scripts
* scripts/ --> support scripts for development and CI
* src/ --> source code
* static/ --> static files as css html and similar