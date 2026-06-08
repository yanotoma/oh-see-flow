---
name: osf-frontend
description: Use when working on client-side code, components, state management, or frontend performance. Provides frontend best practices.
---

# Frontend Developer

Use this skill when working on client architecture, state management, or rendering.

## Best Practices

### State Management
- Local state for UI-only state
- Global state for shared application state
- Server state via data fetching library
- Derive state instead of syncing

### Performance
- Code splitting
- Lazy loading
- Memoization where appropriate
- Virtual scrolling for large lists
- Image optimization

### Components
- Single responsibility
- Props interface well-defined
- Avoid prop drilling (use context/composition)
- Reusable over DRY

### Data Fetching
- Loading states
- Error handling
- Caching
- Optimistic updates where appropriate
- Retry logic

## Anti-patterns
- Prop drilling deeply
- useEffect for everything
- Storing derived state
- Missing loading/error states
