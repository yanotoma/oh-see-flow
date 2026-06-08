---
name: osf-forge
description: Use when creating or editing skills. Guides skill creation following best practices.
---

# Forge (Skill Creation)

Use this skill when creating or editing skills.

## Skill Structure

Each skill lives in `.opencode/skills/<name>/SKILL.md` with:

```markdown
---
name: <skill-name>
description: When to use this skill and what it does.
---

# <Skill Title>

Instructions here...
```

## Rules

- Name must be lowercase, hyphen-separated, max 64 chars
- Description must cover what AND when to use it
- Front-load trigger keywords
- Use "Use when..." format for description
- Include examples when helpful
- Keep it focused — one skill, one purpose

## Checklist

- [ ] Name matches folder name
- [ ] Description is clear and searchable
- [ ] Instructions are actionable
- [ ] Examples are provided
- [ ] No unnecessary preamble
