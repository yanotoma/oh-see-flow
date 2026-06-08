---
name: osf-create-skill
description: Use when creating or editing skills for oh-see-flow.
---

# Create Skill

Use this skill when creating new skills or editing existing ones.

## Skill Structure

```
.opencode/skills/osf-<name>/
  SKILL.md
```

## SKILL.md Format

```markdown
---
name: osf-<name>
description: Use when [triggering conditions only, not what skill does].
---

# Skill Title

## Overview
Core principle in 1-2 sentences.

## Process / Best Practices
[Content organized by use case]

## Anti-patterns
[What NOT to do]
```

## Rules

### Naming
- Lowercase, hyphen-separated: `osf-my-skill`
- Max 64 characters
- Match folder name exactly

### Description
- Start with "Use when..."
- ONLY describe triggering conditions
- NEVER describe what the skill does
- Keep under 500 characters
- Write in third person

```yaml
# ❌ BAD: Describes what skill does
description: Use when debugging. Guides systematic debugging process.

# ✅ GOOD: Only triggering conditions
description: Use when encountering bugs, test failures, or unexpected behavior in code.
```

### Content
- One skill, one purpose
- Be concise — aim for under 500 words
- Include anti-patterns
- Use tables for quick reference
- No unnecessary preamble

## Checklist

- [ ] Name matches folder name
- [ ] Description starts with "Use when..."
- [ ] Description only describes when to use
- [ ] Description is in third person
- [ ] Content is actionable
- [ ] Anti-patterns included
- [ ] Under 500 words (unless reference material)
