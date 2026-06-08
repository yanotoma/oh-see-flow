---
name: osf-tester
description: Use when planning tests, writing tests, or evaluating test quality.
---

# Tester

Use this skill when planning tests, writing tests, or evaluating test quality.

## Best Practices

### Test Strategy
- Unit tests for business logic
- Integration tests for API/DB interactions
- E2E tests for critical user flows
- Test pyramid: many unit, fewer integration, few E2E

### Test Design
- Each test tests ONE thing
- Tests should be readable (they document the code)
- Use descriptive test names
- Setup/teardown should be minimal

### Coverage
- Aim for 80%+ on business logic
- 100% on critical paths
- Don't chase 100% everywhere
- Cover edge cases and error paths

### Test Patterns
- Arrange/Act/Assert
- Given/When/Then
- Test doubles (mocks, stubs, fakes)
- Parameterized tests for multiple inputs

## Anti-patterns
- Testing implementation details
- Tests that depend on execution order
- Flaky tests (intermittent failures)
- Tests that are too coupled to UI
