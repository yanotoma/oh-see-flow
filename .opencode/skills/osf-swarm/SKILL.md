---
name: osf-swarm
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies.
---

# Swarm (Parallel Subagents)

Use this skill to dispatch multiple subagents in parallel.

## When to Use

- Tasks are independent (no shared state)
- Tasks can run in parallel
- Each task is self-contained

## Process

1. Identify independent tasks
2. Dispatch each to the appropriate subagent
3. Collect results as they complete
4. Chain results if needed

## Rules

- Each subagent gets focused context (not full history)
- Subagents save discoveries to Engram independently
- Orchestrator collects and chains results
- If tasks become dependent, switch to sequential

## Example

Building a dashboard with 3 independent panels:
1. Dispatch researcher to understand data model
2. Dispatch coder for panel A
3. Dispatch coder for panel B
4. Dispatch coder for panel C
5. Collect results, run verifier on each
