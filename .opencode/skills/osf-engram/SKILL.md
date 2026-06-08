---
name: osf-engram
description: Use when working with Engram memory — saving, searching, or managing persistent knowledge across sessions.
---

# Engram Memory Protocol

Use this skill for all Engram memory operations.

## When to Save

Save to Engram immediately after:
- Bug fixes (what, why, how)
- Architecture or design decisions
- Configuration changes
- Non-obvious discoveries
- Patterns established
- User preferences learned

## Save Format

```markdown
**What**: [concise description]
**Why**: [reasoning, user request, or problem]
**Where**: [files/paths affected]
**Learned**: [gotchas, edge cases, things that surprised you]
```

## Topic Keys

Use stable topic keys:
- `sdd/<task>/decision` — Design decisions
- `bug/<issue>/root-cause` — Bug root causes
- `code/<feature>/pattern` — Code patterns
- `config/<setting>/change` — Configuration changes
- `user/<preference>` — User preferences

## When to Search

Search Engram before:
- Starting work on something that might have been done before
- The user mentions a topic you have no context on
- Beginning a new task in a familiar area

## Session Lifecycle

- At session start: Check recent context
- During session: Save important discoveries
- At session end: Save session summary

## Rules

- Different topics must not overwrite each other
- Reuse same topic key to update evolving topics
- If unsure about the key, suggest one first
