---
name: osf-isolate
description: Use when starting feature work that needs isolation from current workspace. Creates isolated workspace via git worktree.
---

# Isolate (Git Worktree)

Use this skill when starting feature work that needs isolation.

## Process

1. Create a new branch for the feature
2. Create a git worktree for isolation
3. Run project setup in the worktree
4. Verify clean test baseline
5. Do the work in isolation
6. Merge back when complete

## Commands

```bash
# Create worktree
git worktree add ../feature-branch -b feature/name

# Work in the worktree
cd ../feature-branch

# When done, merge back
cd /path/to/main/repo
git merge feature/name

# Clean up worktree
git worktree remove ../feature-branch
```

## Rules

- Always verify clean tests before starting work
- Keep worktrees short-lived (delete when done)
- Don't commit directly to main from worktree
