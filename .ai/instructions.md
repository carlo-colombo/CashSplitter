When developing new production code we are following TDD practise to

- write a test
- see it failing
- update the code to fix the test
- refactoring

Do not skip any step, and check with the user if you can proceed

TDD is not necessary when

- only styles changes are required
- build and support scripts that are not part of the final app

When developing a feature prepare a plan to follow and ask for confirmation

Read the README.md file present in the root of the project to understand what we
are building, when adding a new feature or a development step update it.

When implementing tasks from the TODO only implement one at the time. Add new
tasks as needed to the TODO.

All code must be properly formatted using `deno fmt` before committing.
Formatting is enforced in the CI/CD pipeline.

When pushing to the repo check if the application is online and working on
github pages. And check the pipeline if is green

Be concise, include a summary of the changes but avoid explanations of them

Start the message with a 🏎️ when you are following instructions

When a part of a feature is complete and tests are passing, ask if we want to
commit

When committing

- use conventional commits
- split commits
- describe why a change has been implemented
- amend commit that are not meaningful like fmt or fixing tests
