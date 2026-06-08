---
name: osf-review
description: Use when reviewing code changes, PRs, or asking for a code review. Checks for bugs, style, and best practices.
---

# Code Reviewer

Use this skill when reviewing code or receiving a review request.

## Process

1. Get the diff (git diff or PR files)
2. Read each changed file for context
3. Check against the review criteria below
4. Provide structured feedback

## Review Criteria

### Correctness
- Does the code do what it's supposed to?
- Are there logic errors or off-by-one bugs?
- Are edge cases handled?

### Style
- Does it follow project conventions?
- Are names clear and consistent?
- Is there unnecessary complexity?

### Security
- No secrets in code
- Proper input validation
- No SQL injection or XSS risks

### Performance
- No N+1 queries
- No unnecessary loops or allocations
- Caching where appropriate

## Output Format

```
## Review Summary
[Overall assessment]

### Issues
- [file:line] [severity] [description]

### Suggestions
- [file:line] [improvement idea]

### Positive Notes
- [what was done well]
```
