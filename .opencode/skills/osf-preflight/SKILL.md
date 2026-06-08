---
name: osf-preflight
description: Use when about to claim work is complete, before committing or creating PRs. Runs verification checks.
---

# Pre-flight Check

Use this skill before saying "done" or "complete".

## Checklist

### Code Quality
- [ ] All tests pass
- [ ] No lint/typecheck errors
- [ ] Code follows project conventions
- [ ] No unnecessary complexity

### Security
- [ ] No secrets in code
- [ ] Proper input validation
- [ ] No SQL injection or XSS risks

### Completeness
- [ ] All requirements addressed
- [ ] Edge cases handled
- [ ] Error handling in place
- [ ] Documentation updated if needed

### Memory
- [ ] Important discoveries saved to Engram
- [ ] Design decisions documented

## Process

1. Run all checks
2. If any fail, fix before reporting done
3. Only claim "complete" when all checks pass
