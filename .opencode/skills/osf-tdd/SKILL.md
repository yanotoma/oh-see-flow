---
name: osf-tdd
description: Use when implementing any feature or bugfix, before writing implementation code.
---

# Test-Driven Development

Use this skill when implementing features or fixing bugs.

## The Cycle

### RED: Write a Failing Test
1. Write a test that describes the expected behavior
2. Run it — it MUST fail (if it passes, the behavior already exists)
3. Commit the failing test

### GREEN: Write Minimal Implementation
1. Write the minimum code to make the test pass
2. Run the test — it MUST pass
3. Don't write extra code beyond what the test requires
4. Commit the passing implementation

### REFACTOR: Clean Up
1. Improve the code without changing behavior
2. Run tests after each change
3. Commit after refactoring

## Rules

- Never write implementation before a failing test
- If a test passes immediately, the behavior already exists — stop
- Delete code written before tests if tests weren't written first
- Each test should test ONE thing
- Tests should be readable — they document the code

## Anti-patterns

- Writing implementation first, then tests
- Writing multiple tests before running any
- Testing implementation details instead of behavior
- Skipping the RED step
