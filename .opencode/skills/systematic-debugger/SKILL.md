---
name: systematic-debugger
description: Use when encountering bugs, test failures, or unexpected behavior. Guides a systematic debugging process.
---

# Systematic Debugging Skill

Use this skill when something is broken or behaving unexpectedly.

## Process

### 1. Understand the Problem
- What is the expected behavior?
- What is the actual behavior?
- What are the exact steps to reproduce?

### 2. Gather Evidence
- Read error messages and stack traces fully
- Check recent changes: `git log --oneline -10` and `git diff`
- Look at relevant logs
- Check if the issue is reproducible

### 3. Isolate
- Narrow down WHERE the problem occurs
- Binary search: does the issue happen before or after point X?
- Check inputs, outputs, and intermediate state

### 4. Hypothesize
- Form a theory about the root cause
- What evidence supports or contradicts it?

### 5. Test
- Design a minimal test to verify the hypothesis
- Change one variable at a time
- If hypothesis is wrong, go back to step 3

### 6. Fix
- Implement the minimal fix
- Don't over-engineer

### 7. Verify
- Confirm the fix resolves the issue
- Check that nothing else broke
- Run relevant tests

## Anti-patterns

- Guessing without evidence
- Changing multiple things at once
- Skipping error message details
- Not checking recent changes
