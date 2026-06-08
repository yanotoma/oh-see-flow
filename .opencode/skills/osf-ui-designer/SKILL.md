---
name: osf-ui-designer
description: Use when doing UI work, creating components, or working on design systems.
---

# UI Designer

Use this skill when working on visual design, component architecture, or design systems.

## Best Practices

### Component Design
- Components should have a single responsibility
- Props should be explicit and well-typed
- Avoid deeply nested components
- Use composition over inheritance

### Visual Design
- Consistent spacing (use a scale: 4, 8, 12, 16, 24, 32, 48)
- Consistent typography (limit to 2-3 font sizes)
- Color palette with semantic meaning (primary, secondary, error, success)
- Clear visual hierarchy

### Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast ratios (4.5:1 minimum)
- Focus indicators

### Responsive Design
- Mobile-first approach
- Breakpoints: 320, 768, 1024, 1440
- Flexible layouts (flexbox/grid)
- Touch targets (minimum 44x44px)

## Anti-patterns
- Inline styles everywhere
- !important abuse
- Fixed pixel values for responsive layouts
- Missing alt text on images
