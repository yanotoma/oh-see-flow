---
name: osf-handle-review
description: Use when receiving code review feedback, before implementing suggestions.
---

# Handle Review Feedback

Use this skill when processing review comments.

## Process

1. Read all feedback carefully
2. Categorize: bug, suggestion, question, style
3. For each item:
   - If it's a bug: fix it
   - If it's a suggestion: evaluate and implement if beneficial
   - If it's a question: answer it
   - If it's a style issue: fix if it matches project conventions
4. Respond to each comment
5. Re-run tests after changes

## Rules

- Don't implement feedback blindly — understand it first
- If you disagree, explain why with evidence
- Always re-run tests after changes
- Thank reviewers for catching issues
