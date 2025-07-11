# Cashsplitter 

Cashsplitter is a tool to help manages expenses when in group of people. 

1. Create a group, and add people to it
2. Add transactions to the group
3. Share the current state of the group

## Tech

* The application uses deno to run in development
* The application is static it does not have servers side components
* It uses preact to implement the UI

## Features

* Works offline as PWA
* Allows merging of the state of the group after diverging
* Stats about the group expenses


## Antifeature

* Manage actual payments, it only bookkeep transactions between the people in the group
* Being universal, transaction amount due or owed are scoped to a group
