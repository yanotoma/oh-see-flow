---
name: osf-design-system
description: Use when creating or working with design systems, DESIGN.md files, or design tokens.
---

# Design System

Use this skill when creating design systems, writing DESIGN.md, or defining design tokens.

## DESIGN.md Structure

```markdown
# Design System

## Colors
- Primary: #hex
- Secondary: #hex
- Error: #hex
- Success: #hex
- Neutral: #hex scale

## Typography
- Font family
- Font sizes (scale)
- Line heights
- Font weights

## Spacing
- Base unit (4px or 8px)
- Scale: 4, 8, 12, 16, 24, 32, 48, 64

## Components
- Button variants
- Input styles
- Card layouts
- Navigation patterns

## Patterns
- Page layouts
- Form patterns
- List patterns
- Empty states
```

## Best Practices

### Tokens
- Use semantic names (not "blue-500" but "primary")
- Support dark/light modes
- Consistent naming convention
- Document usage

### Components
- Document all variants
- Show do's and don'ts
- Include accessibility notes
- Provide code examples

## Anti-patterns
- Too many variants
- Inconsistent naming
- Missing documentation
- No version control
