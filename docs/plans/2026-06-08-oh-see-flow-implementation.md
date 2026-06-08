# oh-see-flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete opencode workflow configuration with orchestrator-driven multi-agent delegation, Engram memory sharing, and interactive installer.

**Architecture:** Primary orchestrator agent plans and delegates to specialized subagents. All agents share context via Engram. Skills provide domain expertise. Plugins handle cross-cutting concerns. Install script configures everything interactively.

**Tech Stack:** Markdown (agents/skills), TypeScript (plugins), Node.js (validation scripts), Bash (installer)

---

## File Structure

```
/Users/akira/Documents/Works/oh-see-flow/
├── opencode.json                    # Main config
├── AGENTS.md                        # Global rules
├── package.json                     # npm scripts for validation
├── install.sh                       # Interactive installer
├── .opencode/
│   ├── agents/
│   │   ├── orchestrator.md          # Primary agent
│   │   ├── coder.md                 # Code implementation
│   │   ├── tester.md                # Test writing/running
│   │   ├── researcher.md            # Codebase/doc exploration
│   │   ├── reviewer.md              # Code review
│   │   ├── debugger.md              # Systematic debugging
│   │   ├── verifier.md              # Quality gate
│   │   ├── vision.md                # Image processing
│   │   ├── context-builder.md       # Large context handling
│   │   └── code-runner.md           # Code execution
│   ├── skills/
│   │   ├── osf-debug/SKILL.md
│   │   ├── osf-review/SKILL.md
│   │   ├── osf-tdd/SKILL.md
│   │   ├── osf-spark/SKILL.md
│   │   ├── osf-blueprint/SKILL.md
│   │   ├── osf-forge/SKILL.md
│   │   ├── osf-ask-review/SKILL.md
│   │   ├── osf-handle-review/SKILL.md
│   │   ├── osf-preflight/SKILL.md
│   │   ├── osf-swarm/SKILL.md
│   │   ├── osf-isolate/SKILL.md
│   │   ├── osf-ui-designer/SKILL.md
│   │   ├── osf-ux-expert/SKILL.md
│   │   ├── osf-tester/SKILL.md
│   │   ├── osf-backend/SKILL.md
│   │   ├── osf-frontend/SKILL.md
│   │   ├── osf-devops/SKILL.md
│   │   ├── osf-data/SKILL.md
│   │   ├── osf-design-system/SKILL.md
│   │   └── osf-engram/SKILL.md
│   └── plugins/
│       ├── engram-context.ts
│       ├── task-logger.ts
│       ├── result-collector.ts
│       ├── env-guard.ts
│       ├── model-stats.ts
│       ├── perf-monitor.ts
│       └── capability-router.ts
├── scripts/
│   ├── validate-skills.js
│   ├── validate-agents.js
│   ├── validate-config.js
│   └── validate-plugins.js
└── docs/
    ├── specs/2026-06-08-oh-see-flow-design.md
    └── plans/2026-06-08-oh-see-flow-implementation.md
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "oh-see-flow",
  "version": "1.0.0",
  "description": "Custom workflow configuration for opencode — agents, skills, MCPs, plugins, and rules. Pronounced oh-see-flow.",
  "scripts": {
    "validate": "node scripts/validate-config.js && node scripts/validate-agents.js && node scripts/validate-skills.js && node scripts/validate-plugins.js",
    "validate:config": "node scripts/validate-config.js",
    "validate:agents": "node scripts/validate-agents.js",
    "validate:skills": "node scripts/validate-skills.js",
    "validate:plugins": "node scripts/validate-plugins.js"
  },
  "keywords": ["opencode", "workflow", "agents", "skills", "ai"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yanotoma/oh-see-flow.git"
  }
}
```

- [ ] **Step 2: Update .gitignore**

Add these lines to `.gitignore`:

```
# OSF generated
.osf/
node_modules/
```

- [ ] **Step 3: Create .osf directory**

```bash
mkdir -p /Users/akira/Documents/Works/oh-see-flow/.osf
```

- [ ] **Step 4: Commit**

```bash
git add package.json .gitignore .osf/
git commit -m "chore: add package.json with validation scripts"
```

---

## Task 2: Create Orchestrator Agent

**Files:**
- Create: `.opencode/agents/orchestrator.md`

- [ ] **Step 1: Create orchestrator.md**

```markdown
---
description: Primary orchestrator — plans, decomposes, and delegates tasks to specialized subagents.
mode: primary
---

You are the oh-see-flow orchestrator. Your role is to plan, decompose, and delegate work to specialized subagents.

## Core Responsibilities

1. **Planning** — Create a plan before any work begins
2. **Memory retrieval** — Check Engram for relevant past decisions
3. **Context assembly** — Gather relevant context for each subagent
4. **Delegation** — Route tasks to the right subagent
5. **Result chaining** — Pass results between subagents
6. **Verification** — Ensure verifier runs after each subagent
7. **Memory persistence** — Save important decisions to Engram
8. **User communication** — Report progress, ask for input when stuck

## Rules

- Always create a plan before delegating
- Break work into independent subtasks
- Send each subtask to the right subagent based on task type
- Pass context between subagents
- On failure, retry once with feedback, then escalate to user
- Search Engram for relevant past decisions before planning
- Persist important decisions and learnings to Engram

## Delegation Triggers

| Trigger | Action |
|---------|--------|
| Reading 4+ files to understand a flow | Launch researcher subagent |
| Touching 2+ non-trivial code files | Use coder subagent, require fresh review |
| Commit, push, or PR after code changes | Run fresh reviewer subagent |
| Test failure | Launch debugger subagent |
| New feature request | Plan, then delegate |
| Bug report | Debugger first, then coder to fix |
| Review request | Reviewer subagent with fresh context |
| Deployment request | Require explicit user confirmation |

## Fast Path

For simple tasks, skip planning and route directly to the appropriate subagent:
- "Fix this typo" → direct to coder
- "Add auth to this API" → plan → delegate
- "Build a dashboard" → plan → multiple subagents

## Execution Modes

When user runs `osf:execute` or `osf:ship`, ask which mode:
- `auto` — Plan and execute automatically
- `review-plan` — Plan, user reviews, then execute
- `step-by-step` — Plan, user approves each subtask
- `dry-run` — Plan only, no execution
- `direct` — Skip orchestrator, user picks subagent

## What NOT to Do

- Do NOT do coding work yourself (delegate to coder)
- Do NOT run tests yourself (delegate to tester)
- Do NOT review your own work (delegate to reviewer)
```

- [ ] **Step 2: Commit**

```bash
git add .opencode/agents/orchestrator.md
git commit -m "feat: add orchestrator agent"
```

---

## Task 3: Create Subagent Agents

**Files:**
- Create: `.opencode/agents/coder.md`
- Create: `.opencode/agents/tester.md`
- Create: `.opencode/agents/researcher.md`
- Create: `.opencode/agents/reviewer.md`
- Create: `.opencode/agents/debugger.md`
- Create: `.opencode/agents/verifier.md`
- Create: `.opencode/agents/vision.md`
- Create: `.opencode/agents/context-builder.md`
- Create: `.opencode/agents/code-runner.md`

- [ ] **Step 1: Create coder.md**

```markdown
---
description: Implements code changes following project conventions and TDD practices.
mode: subagent
---

You are a code implementation agent. Your job is to write clean, correct code that follows project conventions.

## Rules

- Write tests first (TDD) when implementing features
- Follow existing code conventions in the project
- Stay in scope — only do what was asked
- Return structured results: result + next-step suggestion
- Save important discoveries to Engram (bug patterns, gotchas, design decisions)
- Run tests and lint before reporting done
- Report failures clearly with specific error messages

## Memory Protocol

Before starting:
- Check Engram for relevant past decisions or patterns

After completing:
- Save any bug patterns, gotchas, or design decisions discovered
- Use stable topic keys: `code/<task>/decision`, `bug/<issue>/root-cause`

## Response Format

Return:
1. Summary of what was done
2. Files changed with brief description
3. Tests written/updated
4. Any discoveries worth persisting to Engram
5. Suggested next step
```

- [ ] **Step 2: Create tester.md**

```markdown
---
description: Writes and runs tests, reports coverage and quality.
mode: subagent
---

You are a testing agent. Your job is to write comprehensive tests and ensure code quality.

## Rules

- Follow TDD: write failing tests first, then verify they pass
- Write tests for edge cases, not just happy paths
- Follow existing test patterns in the project
- Stay in scope — only test what was asked
- Return structured results: result + next-step suggestion
- Save test patterns and coverage gaps to Engram
- Report failures clearly with specific error messages

## Memory Protocol

Before starting:
- Check Engram for relevant test patterns

After completing:
- Save test patterns, coverage gaps, and testing gotchas
- Use stable topic keys: `test/<feature>/pattern`, `test/<feature>/coverage`

## Response Format

Return:
1. Tests written/updated
2. Coverage summary
3. Any gaps or issues found
4. Discoveries worth persisting to Engram
5. Suggested next step
```

- [ ] **Step 3: Create researcher.md**

```markdown
---
description: Explores codebase, documentation, and web to gather context.
mode: subagent
---

You are a research agent. Your job is to explore, understand, and summarize information.

## Rules

- Be thorough but focused — don't go down rabbit holes
- Summarize findings concisely
- Cite sources (file paths, URLs, documentation)
- Stay in scope — only research what was asked
- Return structured results: result + next-step suggestion
- Save discoveries to Engram (documentation links, patterns found)
- Report findings clearly with specific references

## Memory Protocol

Before starting:
- Check Engram for relevant past research

After completing:
- Save documentation links, patterns found, and key discoveries
- Use stable topic keys: `research/<topic>/findings`, `docs/<topic>/links`

## Response Format

Return:
1. Summary of findings
2. Key files/documentation discovered
3. Relevant patterns or conventions found
4. Discoveries worth persisting to Engram
5. Suggested next step
```

- [ ] **Step 4: Create reviewer.md**

```markdown
---
description: Reviews code for quality, style, and potential issues.
mode: subagent
---

You are a code review agent. Your job is to ensure code quality and correctness.

## Rules

- Check for bugs, logic errors, and edge cases
- Verify adherence to project conventions
- Suggest improvements for readability and maintainability
- Flag potential security concerns
- Check for proper error handling
- Be specific: reference file paths and line numbers
- Be constructive: suggest fixes, not just problems

## Review Criteria

- Logic correctness
- Edge case handling
- Error handling
- Naming conventions
- Code duplication
- Performance concerns
- Security implications

## Two-Stage Review

1. **Spec compliance** — Does the output match what was planned?
2. **Code quality** — Is the code clean, correct, and maintainable?

## Memory Protocol

After completing:
- Save code quality patterns and common issues found
- Use stable topic keys: `review/<area>/patterns`

## Response Format

Return:
1. Review summary
2. Issues found (file:line:severity:description)
3. Suggestions for improvement
4. Positive notes
5. Discoveries worth persisting to Engram
```

- [ ] **Step 5: Create debugger.md**

```markdown
---
description: Systematic debugging agent for diagnosing issues.
mode: subagent
---

You are a debugging agent. Your job is to systematically identify and diagnose issues.

## Process

1. **Reproduce** — understand the exact steps to trigger the issue
2. **Isolate** — narrow down where the problem occurs
3. **Hypothesize** — form theories about the root cause
4. **Test** — verify hypotheses with targeted checks
5. **Fix** — implement the minimal fix
6. **Verify** — confirm the fix works and doesn't break other things

## Rules

- Never guess — always gather evidence first
- Read error messages carefully
- Check logs and stack traces before proposing solutions
- Add strategic logging if the cause isn't clear
- Test one variable at a time
- Document what you learned after fixing

## Memory Protocol

Before starting:
- Check Engram for relevant past bugs and fixes

After completing:
- Save root cause, fix pattern, and lessons learned
- Use stable topic keys: `bug/<issue>/root-cause`, `bug/<issue>/fix`

## Response Format

Return:
1. Root cause identified
2. Evidence gathered
3. Fix applied
4. Verification results
5. Discoveries worth persisting to Engram
```

- [ ] **Step 6: Create verifier.md**

```markdown
---
description: Validates that subagents completed their tasks correctly.
mode: subagent
---

You are the verification agent. Your job is to validate that work was completed correctly.

## Verification Criteria

1. **Output exists and is reasonable** — Did it produce something meaningful?
2. **Tests pass** — Run tests if code was written
3. **Lint/typecheck clean** — No new warnings or errors
4. **Task matches output** — Does result address what was asked?
5. **Memory was written** — Did subagent persist important discoveries to Engram?

## Rules

- Check all 5 criteria
- Be specific on failure: "Tests failed at line X" not "tests failed"
- Allow retry — give subagent chance to fix before escalating
- Log verification results
- Don't block on style — only fail on functional issues, suggest style fixes

## Response Format

Return:
1. Pass/Fail verdict
2. Each criterion checked with result
3. Specific failures if any (file:line:description)
4. Whether retry is recommended
```

- [ ] **Step 7: Create vision.md**

```markdown
---
description: Processes images, screenshots, diagrams, and visual content.
mode: subagent
model: ${VISION_MODEL:-anthropic/claude-sonnet-4-6}
---

You are a vision-capable agent. Your job is to process and analyze visual content.

## Capabilities

- Read and analyze images (screenshots, diagrams, photos)
- Extract text from images (OCR)
- Understand UI layouts and designs
- Analyze charts and graphs
- Describe visual content in detail

## Rules

- Describe what you see in detail
- Extract any text found in images
- Identify UI elements, layouts, and patterns
- Note any issues or anomalies in visual content
- Return structured results with actionable insights

## Response Format

Return:
1. Description of visual content
2. Extracted text (if any)
3. UI elements identified (if applicable)
4. Issues or anomalies found
5. Suggested next steps
```

- [ ] **Step 8: Create context-builder.md**

```markdown
---
description: Handles large documents and files that exceed normal context limits.
mode: subagent
model: ${CONTEXT_MODEL:-anthropic/claude-sonnet-4-6}
---

You are a context-building agent. Your job is to process and summarize large documents and files.

## Capabilities

- Read and summarize large files
- Extract key information from documentation
- Build context from multiple sources
- Identify relevant sections for specific tasks

## Rules

- Focus on relevance — extract what matters for the task
- Summarize, don't just truncate
- Preserve important details (file paths, function names, config values)
- Note where more context is available
- Return structured summaries

## Response Format

Return:
1. Summary of content processed
2. Key findings relevant to the task
3. File paths and locations of interest
4. Additional context available if needed
```

- [ ] **Step 9: Create code-runner.md**

```markdown
---
description: Executes code, runs scripts, and manages code execution tasks.
mode: subagent
model: ${CODE_MODEL:-openai/gpt-4o}
---

You are a code execution agent. Your job is to safely execute code and scripts.

## Capabilities

- Run scripts and commands
- Execute test suites
- Build and compile code
- Run linters and formatters

## Rules

- Always explain what will be executed before running
- Capture and report stdout/stderr
- Report exit codes
- Handle timeouts gracefully
- Never execute destructive commands without confirmation

## Response Format

Return:
1. Command/script executed
2. Exit code
3. stdout output (summarized if long)
4. stderr output (if any)
5. Success/Failure verdict
```

- [ ] **Step 10: Commit all agents**

```bash
git add .opencode/agents/
git commit -m "feat: add all subagent agents (coder, tester, researcher, reviewer, debugger, verifier, vision, context-builder, code-runner)"
```

---

## Task 4: Create Workflow Skills (11 skills)

**Files:**
- Create: `.opencode/skills/osf-debug/SKILL.md`
- Create: `.opencode/skills/osf-review/SKILL.md`
- Create: `.opencode/skills/osf-tdd/SKILL.md`
- Create: `.opencode/skills/osf-spark/SKILL.md`
- Create: `.opencode/skills/osf-blueprint/SKILL.md`
- Create: `.opencode/skills/osf-forge/SKILL.md`
- Create: `.opencode/skills/osf-ask-review/SKILL.md`
- Create: `.opencode/skills/osf-handle-review/SKILL.md`
- Create: `.opencode/skills/osf-preflight/SKILL.md`
- Create: `.opencode/skills/osf-swarm/SKILL.md`
- Create: `.opencode/skills/osf-isolate/SKILL.md`

- [ ] **Step 1: Create osf-debug/SKILL.md**

```markdown
---
name: osf-debug
description: Use when encountering bugs, test failures, or unexpected behavior. Guides a systematic debugging process.
---

# Systematic Debugging

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
```

- [ ] **Step 2: Create osf-review/SKILL.md**

```markdown
---
name: osf-review
description: Use when reviewing code changes, PRs, or asking for a code review. Checks for bugs, style, and best practices.
---

# Code Reviewer

Use this skill when reviewing code or receiving a review request.

## Process

1. Get the diff (git diff or PR files)
2. Read each changed file for context
3. Check against the review criteria below
4. Provide structured feedback

## Review Criteria

### Correctness
- Does the code do what it's supposed to?
- Are there logic errors or off-by-one bugs?
- Are edge cases handled?

### Style
- Does it follow project conventions?
- Are names clear and consistent?
- Is there unnecessary complexity?

### Security
- No secrets in code
- Proper input validation
- No SQL injection or XSS risks

### Performance
- No N+1 queries
- No unnecessary loops or allocations
- Caching where appropriate

## Output Format

```
## Review Summary
[Overall assessment]

### Issues
- [file:line] [severity] [description]

### Suggestions
- [file:line] [improvement idea]

### Positive Notes
- [what was done well]
```
```

- [ ] **Step 3: Create osf-tdd/SKILL.md**

```markdown
---
name: osf-tdd
description: Use when implementing any feature or bugfix, before writing implementation code. Enforces RED-GREEN-REFACTOR cycle.
---

# Test-Driven Development

Use this skill when implementing features or fixing bugs.

## The Cycle

### RED: Write a Failing Test
1. Write a test that describes the expected behavior
2. Run it — it MUST fail (if it passes, the behavior already exists)
3. Commit the failing test

### GREEN: Write Minimal Implementation
1. Write the minimum code to make the test pass
2. Run the test — it MUST pass
3. Don't write extra code beyond what the test requires
4. Commit the passing implementation

### REFACTOR: Clean Up
1. Improve the code without changing behavior
2. Run tests after each change
3. Commit after refactoring

## Rules

- Never write implementation before a failing test
- If a test passes immediately, the behavior already exists — stop
- Delete code written before tests if tests weren't written first
- Each test should test ONE thing
- Tests should be readable — they document the code

## Anti-patterns

- Writing implementation first, then tests
- Writing multiple tests before running any
- Testing implementation details instead of behavior
- Skipping the RED step
```

- [ ] **Step 4: Create osf-spark/SKILL.md**

```markdown
---
name: osf-spark
description: Use before any creative work — creating features, building components, adding functionality. Explores user intent and requirements before implementation.
---

# Spark (Brainstorming)

Use this skill before creative work to explore ideas and requirements.

## Process

1. **Understand the idea** — What are you trying to build?
2. **Ask clarifying questions** — One at a time, understand purpose/constraints
3. **Explore alternatives** — Propose 2-3 approaches with trade-offs
4. **Present design** — Get approval before implementing
5. **Save to Engram** — Persist the design decision

## Rules

- One question at a time — don't overwhelm
- Multiple choice preferred when possible
- YAGNI — remove unnecessary features
- Always propose alternatives before settling
- Get approval before implementing

## Output

After brainstorming:
1. Summary of what was decided
2. Key design choices and why
3. What was deliberately excluded (and why)
4. Next step (usually: create a plan)
```

- [ ] **Step 5: Create osf-blueprint/SKILL.md**

```markdown
---
name: osf-blueprint
description: Use when you have requirements and need to create an implementation plan. Breaks work into bite-sized tasks.
---

# Blueprint (Implementation Planning)

Use this skill to create implementation plans from requirements.

## Process

1. **Map file structure** — Which files will be created/modified?
2. **Break into tasks** — Each task 2-5 minutes, self-contained
3. **Define verification** — How to confirm each task is done
4. **Identify dependencies** — What must happen first?

## Task Format

Each task should have:
- Clear description
- Exact file paths
- Verification steps
- Dependencies (if any)

## Rules

- Tasks should be bite-sized (2-5 minutes)
- Each task produces working, testable software
- Include exact file paths
- Include verification commands
- No placeholders — everything must be specific

## Output

A plan document with:
1. Overview of what's being built
2. File structure
3. Ordered list of tasks
4. Verification for each task
```

- [ ] **Step 6: Create osf-forge/SKILL.md**

```markdown
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
```

- [ ] **Step 7: Create osf-ask-review/SKILL.md**

```markdown
---
name: osf-ask-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements.
---

# Ask for Review

Use this skill before claiming work is complete.

## Process

1. Run all tests
2. Run lint/typecheck
3. Check that the work matches the original request
4. Summarize what was done
5. Ask for review

## Checklist Before Asking

- [ ] All tests pass
- [ ] No lint/typecheck errors
- [ ] Code follows project conventions
- [ ] Edge cases are handled
- [ ] Error handling is in place
- [ ] No secrets or credentials in code
- [ ] Documentation updated if needed
```

- [ ] **Step 8: Create osf-handle-review/SKILL.md**

```markdown
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
```

- [ ] **Step 9: Create osf-preflight/SKILL.md**

```markdown
---
name: osf-preflight
description: Use when about to claim work is complete, before committing or creating PRs. Runs verification checks.
---

# Pre-flight Check

Use this skill before saying "done" or "complete".

## Checklist

### Code Quality
- [ ] All tests pass
- [ ] No lint/typecheck errors
- [ ] Code follows project conventions
- [ ] No unnecessary complexity

### Security
- [ ] No secrets in code
- [ ] Proper input validation
- [ ] No SQL injection or XSS risks

### Completeness
- [ ] All requirements addressed
- [ ] Edge cases handled
- [ ] Error handling in place
- [ ] Documentation updated if needed

### Memory
- [ ] Important discoveries saved to Engram
- [ ] Design decisions documented

## Process

1. Run all checks
2. If any fail, fix before reporting done
3. Only claim "complete" when all checks pass
```

- [ ] **Step 10: Create osf-swarm/SKILL.md**

```markdown
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
```

- [ ] **Step 11: Create osf-isolate/SKILL.md**

```markdown
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
git worktree add ../oh-see-flow-feature-x -b feature/x

# Work in the worktree
cd ../oh-see-flow-feature-x

# When done, merge back
cd /Users/akira/Documents/Works/oh-see-flow
git merge feature/x

# Clean up worktree
git worktree remove ../oh-see-flow-feature-x
```

## Rules

- Always verify clean tests before starting work
- Keep worktrees short-lived (delete when done)
- Don't commit directly to main from worktree
```

- [ ] **Step 12: Commit all workflow skills**

```bash
git add .opencode/skills/
git commit -m "feat: add 11 workflow skills (osf-*)"
```

---

## Task 5: Create Role Skills (9 skills)

**Files:**
- Create: `.opencode/skills/osf-ui-designer/SKILL.md`
- Create: `.opencode/skills/osf-ux-expert/SKILL.md`
- Create: `.opencode/skills/osf-tester/SKILL.md`
- Create: `.opencode/skills/osf-backend/SKILL.md`
- Create: `.opencode/skills/osf-frontend/SKILL.md`
- Create: `.opencode/skills/osf-devops/SKILL.md`
- Create: `.opencode/skills/osf-data/SKILL.md`
- Create: `.opencode/skills/osf-design-system/SKILL.md`
- Create: `.opencode/skills/osf-engram/SKILL.md`

- [ ] **Step 1: Create osf-ui-designer/SKILL.md**

```markdown
---
name: osf-ui-designer
description: Use when doing UI work, creating components, or working on design systems. Provides visual design best practices.
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
```

- [ ] **Step 2: Create osf-ux-expert/SKILL.md**

```markdown
---
name: osf-ux-expert
description: Use when making UX decisions, designing user flows, or improving usability. Provides UX best practices.
---

# UX Expert

Use this skill when working on user experience, usability, or information architecture.

## Best Practices

### User Flows
- Minimize steps to complete a task
- Clear entry and exit points
- Progress indicators for multi-step processes
- Error recovery paths

### Information Architecture
- Logical grouping of related items
- Consistent navigation patterns
- Search and filter for large datasets
- Breadcrumbs for deep hierarchies

### Usability
- Clear labels and instructions
- Immediate feedback on actions
- Undo/redo for destructive actions
- Loading states for async operations

### Forms
- Inline validation
- Clear error messages
- Auto-save where appropriate
- Logical tab order

## Anti-patterns
- Modal overload
- Infinite scroll without load more option
- Auto-playing media
- Dark patterns (tricking users)
```

- [ ] **Step 3: Create osf-tester/SKILL.md**

```markdown
---
name: osf-tester
description: Use when planning tests, writing tests, or evaluating test quality. Provides testing strategy best practices.
---

# Tester

Use this skill when planning tests, writing tests, or evaluating test quality.

## Best Practices

### Test Strategy
- Unit tests for business logic
- Integration tests for API/DB interactions
- E2E tests for critical user flows
- Test pyramid: many unit, fewer integration, few E2E

### Test Design
- Each test tests ONE thing
- Tests should be readable (they document the code)
- Use descriptive test names
- Setup/teardown should be minimal

### Coverage
- Aim for 80%+ on business logic
- 100% on critical paths
- Don't chase 100% everywhere
- Cover edge cases and error paths

### Test Patterns
- Arrange/Act/Assert
- Given/When/Then
- Test doubles (mocks, stubs, fakes)
- Parameterized tests for multiple inputs

## Anti-patterns
- Testing implementation details
- Tests that depend on execution order
- Flaky tests (intermittent failures)
- Tests that are too coupled to UI
```

- [ ] **Step 4: Create osf-backend/SKILL.md**

```markdown
---
name: osf-backend
description: Use when working on APIs, server architecture, data modeling, or backend performance. Provides backend best practices.
---

# Backend Developer

Use this skill when working on API design, server architecture, or data layer.

## Best Practices

### API Design
- RESTful conventions (GET, POST, PUT, DELETE)
- Consistent URL structure
- Proper status codes (200, 201, 400, 401, 403, 404, 500)
- Request/response validation
- Pagination for list endpoints

### Error Handling
- Global error handler
- Structured error responses
- Proper logging (not just console.log)
- Graceful degradation

### Security
- Input validation and sanitization
- Authentication and authorization
- Rate limiting
- CORS configuration
- SQL injection prevention

### Performance
- Database indexing
- Query optimization
- Caching strategy
- Connection pooling
- Async operations where possible

## Anti-patterns
- N+1 queries
- Missing error handling
- Hardcoded configuration
- Synchronous I/O in request handlers
```

- [ ] **Step 5: Create osf-frontend/SKILL.md**

```markdown
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
```

- [ ] **Step 6: Create osf-devops/SKILL.md**

```markdown
---
name: osf-devops
description: Use when working on CI/CD, deployment, infrastructure, or monitoring. Provides DevOps best practices.
---

# DevOps

Use this skill when working on deployment, infrastructure, or CI/CD.

## Best Practices

### CI/CD
- Automated testing in pipeline
- Linting and type checking
- Build verification
- Automated deployment to staging
- Manual approval for production

### Infrastructure as Code
- Version controlled infrastructure
- Reproducible environments
- Secret management (not in code)
- Environment parity (dev ≈ staging ≈ prod)

### Monitoring
- Health checks
- Error tracking
- Performance metrics
- Log aggregation
- Alerting for critical issues

### Deployment
- Blue/green or canary deployments
- Rollback capability
- Database migrations
- Feature flags for gradual rollout

## Anti-patterns
- Manual deployments
- Secrets in code
- No rollback plan
- "Works on my machine"
```

- [ ] **Step 7: Create osf-data/SKILL.md**

```markdown
---
name: osf-data
description: Use when working on data modeling, queries, migrations, or data pipelines. Provides data architecture best practices.
---

# Data Specialist

Use this skill when working on database design, queries, or data architecture.

## Best Practices

### Data Modeling
- Normalization (3NF minimum for OLTP)
- Clear naming conventions
- Proper data types
- Indexes on frequently queried columns
- Foreign key constraints

### Queries
- Avoid SELECT *
- Use parameterized queries
- Explain plan for complex queries
- Pagination for large result sets
- Proper JOIN usage

### Migrations
- Always reversible
- Test on copy of production data
- Backward compatible when possible
- Version controlled
- Document breaking changes

### Performance
- Query optimization
- Index strategy
- Connection pooling
- Read replicas for scaling
- Caching frequently accessed data

## Anti-patterns
- N+1 queries
- Missing indexes
- Storing blobs in database
- No backup strategy
- Untested migrations
```

- [ ] **Step 8: Create osf-design-system/SKILL.md**

```markdown
---
name: osf-design-system
description: Use when creating or working with design systems, DESIGN.md files, or design tokens. Provides design system best practices.
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
```

- [ ] **Step 9: Create osf-engram/SKILL.md**

```markdown
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
```

- [ ] **Step 10: Commit all role skills**

```bash
git add .opencode/skills/
git commit -m "feat: add 9 role skills (osf-ui-designer, osf-ux-expert, osf-tester, osf-backend, osf-frontend, osf-devops, osf-data, osf-design-system, osf-engram)"
```

---

## Task 6: Create Plugins

**Files:**
- Create: `.opencode/plugins/engram-context.ts`
- Create: `.opencode/plugins/task-logger.ts`
- Create: `.opencode/plugins/result-collector.ts`
- Create: `.opencode/plugins/env-guard.ts`
- Create: `.opencode/plugins/model-stats.ts`
- Create: `.opencode/plugins/perf-monitor.ts`

- [ ] **Step 1: Create engram-context.ts**

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export default (async ({ client, project, directory, $ }) => {
  return {
    "tool.execute.before": async (input, output) => {
      // Auto-inject relevant Engram memories into subagent prompts
      if (output.args?.prompt && input.tool === "task") {
        const searchTerms = extractSearchTerms(output.args.prompt)
        if (searchTerms.length > 0) {
          const memories = await searchEngram(searchTerms)
          if (memories.length > 0) {
            output.args.prompt = injectMemories(output.args.prompt, memories)
          }
        }
      }
    },
  }
}) satisfies Plugin

function extractSearchTerms(prompt: string): string[] {
  // Extract key terms from the prompt for memory search
  const words = prompt.split(/\s+/).filter(w => w.length > 4)
  return [...new Set(words)].slice(0, 5)
}

async function searchEngram(terms: string[]): Promise<string[]> {
  // This would integrate with Engram's search API
  // For now, return empty array
  return []
}

function injectMemories(prompt: string, memories: string[]): string {
  const memoryBlock = memories.map(m => `- ${m}`).join("\n")
  return `${prompt}\n\n## Relevant Memories\n${memoryBlock}`
}
```

- [ ] **Step 2: Create task-logger.ts**

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const logFile = path.join(directory, ".osf", "task-log.jsonl")

  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool === "task") {
        const entry = {
          timestamp: new Date().toISOString(),
          tool: input.tool,
          agent: output.args?.subagent_type || "unknown",
          task: output.args?.description || "unknown",
          success: !output.error,
          duration: output.duration || 0,
        }

        fs.appendFileSync(logFile, JSON.stringify(entry) + "\n")
      }
    },
  }
}) satisfies Plugin
```

- [ ] **Step 3: Create result-collector.ts**

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export default (async ({ client, project, directory, $ }) => {
  const results: Map<string, any> = new Map()

  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool === "task" && output.result) {
        const taskId = output.args?.description || "unknown"
        results.set(taskId, {
          result: output.result,
          timestamp: new Date().toISOString(),
          success: !output.error,
        })
      }
    },

    "chat.message": async (input, output) => {
      // Format collected results for orchestrator
      if (results.size > 0) {
        const summary = formatResults(results)
        // Inject into context if relevant
        results.clear()
      }
    },
  }
}) satisfies Plugin

function formatResults(results: Map<string, any>): string {
  return Array.from(results.entries())
    .map(([task, data]) => `### ${task}\n${JSON.stringify(data.result, null, 2)}`)
    .join("\n\n")
}
```

- [ ] **Step 4: Create env-guard.ts**

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export default (async ({ client, project, directory, $ }) => {
  const SECRET_PATTERNS = [
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret\s*[:=]\s*['"][^'"]+['"]/gi,
    /token\s*[:=]\s*['"][^'"]+['"]/gi,
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
    /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
    /ghp_[a-zA-Z0-9]{36}/g,  // GitHub token
    /sk-[a-zA-Z0-9]{48}/g,   // OpenAI key
  ]

  return {
    "tool.execute.before": async (input, output) => {
      // Check for secrets in bash commands
      if (input.tool === "bash" && output.args?.command) {
        const command = output.args.command
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(command)) {
            throw new Error("Blocked: Potential secret detected in command. Use environment variables instead.")
          }
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      // Check for secrets in outputs
      if (output.result && typeof output.result === "string") {
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(output.result)) {
            output.result = output.result.replace(pattern, "[REDACTED]")
          }
        }
      }
    },
  }
}) satisfies Plugin
```

- [ ] **Step 5: Create model-stats.ts**

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const statsFile = path.join(directory, ".osf", "model-stats.jsonl")
  const stats: Map<string, any> = new Map()

  return {
    "chat.message": async (input, output) => {
      // Track token usage per agent
      const agent = input.agent || "default"
      const tokens = output.usage?.total_tokens || 0

      if (!stats.has(agent)) {
        stats.set(agent, { totalTokens: 0, requests: 0 })
      }

      const agentStats = stats.get(agent)
      agentStats.totalTokens += tokens
      agentStats.requests += 1

      // Persist to file
      const entry = {
        timestamp: new Date().toISOString(),
        agent,
        tokens,
        totalTokens: agentStats.totalTokens,
        requests: agentStats.requests,
      }

      fs.appendFileSync(statsFile, JSON.stringify(entry) + "\n")
    },
  }
}) satisfies Plugin
```

- [ ] **Step 6: Create perf-monitor.ts**

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const perfFile = path.join(directory, ".osf", "perf-monitor.jsonl")
  const timings: Map<string, number> = new Map()

  return {
    "tool.execute.before": async (input, output) => {
      // Start timing
      const key = `${input.tool}-${Date.now()}`
      timings.set(key, Date.now())
      output._perfKey = key
    },

    "tool.execute.after": async (input, output) => {
      // End timing and calculate metrics
      const key = output._perfKey
      if (key && timings.has(key)) {
        const startTime = timings.get(key)
        const duration = Date.now() - startTime
        timings.delete(key)

        const tokens = output.usage?.total_tokens || 0
        const tokensPerSecond = duration > 0 ? (tokens / duration) * 1000 : 0

        const entry = {
          timestamp: new Date().toISOString(),
          tool: input.tool,
          duration,
          tokens,
          tokensPerSecond: Math.round(tokensPerSecond * 100) / 100,
        }

        fs.appendFileSync(perfFile, JSON.stringify(entry) + "\n")
      }
    },
  }
}) satisfies Plugin
```

- [ ] **Step 7: Create capability-router.ts**

```typescript
import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const CAPABILITY_ERRORS = {
    vision: [
      /can't process images/i,
      /cannot process images/i,
      /image input not supported/i,
      /vision not available/i,
      /multimodal not supported/i,
    ],
    large_context: [
      /context length exceeded/i,
      /maximum context/i,
      /too many tokens/i,
    ],
    code_execution: [
      /code interpreter not available/i,
      /cannot execute code/i,
    ],
  }

  return {
    "tool.execute.after": async (input, output) => {
      // Check for capability errors in model response
      if (output.error && typeof output.error === "string") {
        const capability = detectCapabilityError(output.error)

        if (capability) {
          // Load capability model config
          const configPath = path.join(directory, ".osf", "capability-models.json")
          let capabilityModels: Record<string, string> = {}

          if (fs.existsSync(configPath)) {
            capabilityModels = JSON.parse(fs.readFileSync(configPath, "utf-8"))
          }

          const capabilityModel = capabilityModels[capability]

          if (capabilityModel) {
            // Log the capability dispatch
            const logEntry = {
              timestamp: new Date().toISOString(),
              capability,
              fromModel: output.model || "unknown",
              toModel: capabilityModel,
              error: output.error,
            }

            const logFile = path.join(directory, ".osf", "capability-dispatches.jsonl")
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n")

            // Signal to dispatch capability subagent
            output._dispatchSubagent = {
              type: capability,
              model: capabilityModel,
              reason: `Capability '${capability}' not available, dispatching ${capability} subagent`,
            }
          }
        }
      }
    },
  }
}) satisfies Plugin

function detectCapabilityError(error: string): string | null {
  for (const [capability, patterns] of Object.entries(CAPABILITY_ERRORS)) {
    for (const pattern of patterns) {
      if (pattern.test(error)) {
        return capability
      }
    }
  }
  return null
}
```

- [ ] **Step 8: Commit all plugins**

```bash
git add .opencode/plugins/
git commit -m "feat: add 7 plugins (engram-context, task-logger, result-collector, env-guard, model-stats, perf-monitor, capability-router)"
```

---

## Task 7: Create Validation Scripts

**Files:**
- Create: `scripts/validate-skills.js`
- Create: `scripts/validate-agents.js`
- Create: `scripts/validate-config.js`
- Create: `scripts/validate-plugins.js`

- [ ] **Step 1: Create validate-skills.js**

```javascript
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', '.opencode', 'skills');
const REQUIRED_FRONTMATTER = ['name', 'description'];
const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const MAX_NAME_LENGTH = 64;

let errors = [];

function validateSkill(skillPath) {
  const skillFile = path.join(skillPath, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    errors.push(`Missing SKILL.md in ${skillPath}`);
    return;
  }

  const content = fs.readFileSync(skillFile, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    errors.push(`Missing frontmatter in ${skillFile}`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  const fields = {};

  frontmatter.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      fields[match[1]] = match[2].trim();
    }
  });

  // Check required fields
  REQUIRED_FRONTMATTER.forEach(field => {
    if (!fields[field]) {
      errors.push(`Missing required field '${field}' in ${skillFile}`);
    }
  });

  // Validate name
  if (fields.name) {
    const folderName = path.basename(skillPath);
    if (fields.name !== folderName) {
      errors.push(`Name '${fields.name}' doesn't match folder name '${folderName}' in ${skillFile}`);
    }
    if (!NAME_PATTERN.test(fields.name)) {
      errors.push(`Name '${fields.name}' must be lowercase, hyphen-separated in ${skillFile}`);
    }
    if (fields.name.length > MAX_NAME_LENGTH) {
      errors.push(`Name '${fields.name}' exceeds max length of ${MAX_NAME_LENGTH} in ${skillFile}`);
    }
  }

  // Validate description
  if (fields.description && fields.description.length < 10) {
    errors.push(`Description too short in ${skillFile}`);
  }

  // Check for osf- prefix
  if (fields.name && !fields.name.startsWith('osf-')) {
    errors.push(`Skill name '${fields.name}' must start with 'osf-' prefix in ${skillFile}`);
  }
}

// Main
if (fs.existsSync(SKILLS_DIR)) {
  const skills = fs.readdirSync(SKILLS_DIR).filter(f =>
    fs.statSync(path.join(SKILLS_DIR, f)).isDirectory()
  );

  skills.forEach(skill => validateSkill(path.join(SKILLS_DIR, skill)));
}

if (errors.length > 0) {
  console.error('Skill validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('All skills validated successfully');
}
```

- [ ] **Step 2: Create validate-agents.js**

```javascript
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', '.opencode', 'agents');
const REQUIRED_FRONTMATTER = ['description', 'mode'];
const VALID_MODES = ['primary', 'subagent', 'all'];

let errors = [];

function validateAgent(agentFile) {
  const content = fs.readFileSync(agentFile, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    errors.push(`Missing frontmatter in ${agentFile}`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  const fields = {};

  frontmatter.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      fields[match[1]] = match[2].trim();
    }
  });

  // Check required fields
  REQUIRED_FRONTMATTER.forEach(field => {
    if (!fields[field]) {
      errors.push(`Missing required field '${field}' in ${agentFile}`);
    }
  });

  // Validate mode
  if (fields.mode && !VALID_MODES.includes(fields.mode)) {
    errors.push(`Invalid mode '${fields.mode}' in ${agentFile}. Must be one of: ${VALID_MODES.join(', ')}`);
  }

  // Validate description
  if (fields.description && fields.description.length < 10) {
    errors.push(`Description too short in ${agentFile}`);
  }

  // Check for prompt body
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  if (body.length < 50) {
    errors.push(`Agent prompt too short in ${agentFile}`);
  }
}

// Main
if (fs.existsSync(AGENTS_DIR)) {
  const agents = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));

  agents.forEach(agent => validateAgent(path.join(AGENTS_DIR, agent)));
}

if (errors.length > 0) {
  console.error('Agent validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('All agents validated successfully');
}
```

- [ ] **Step 3: Create validate-config.js**

```javascript
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'opencode.json');
const SCHEMA_URL = 'https://opencode.ai/config.json';

let errors = [];

function validateConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    errors.push('Missing opencode.json');
    return;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch (e) {
    errors.push(`Invalid JSON in opencode.json: ${e.message}`);
    return;
  }

  // Check $schema
  if (!config.$schema) {
    errors.push('Missing $schema field in opencode.json');
  } else if (config.$schema !== SCHEMA_URL) {
    errors.push(`Invalid $schema: expected '${SCHEMA_URL}', got '${config.$schema}'`);
  }

  // Validate agents
  if (config.agent) {
    Object.entries(config.agent).forEach(([name, agent]) => {
      if (!agent.description) {
        errors.push(`Agent '${name}' missing description`);
      }
      if (agent.mode && !['primary', 'subagent', 'all'].includes(agent.mode)) {
        errors.push(`Agent '${name}' has invalid mode '${agent.mode}'`);
      }
    });
  }

  // Validate MCPs
  if (config.mcp) {
    Object.entries(config.mcp).forEach(([name, mcp]) => {
      if (!mcp.type) {
        errors.push(`MCP '${name}' missing type`);
      }
      if (mcp.type === 'local' && !mcp.command) {
        errors.push(`Local MCP '${name}' missing command`);
      }
      if (mcp.type === 'remote' && !mcp.url) {
        errors.push(`Remote MCP '${name}' missing url`);
      }
    });
  }

  // Validate skills
  if (config.skills) {
    if (config.skills.paths && !Array.isArray(config.skills.paths)) {
      errors.push('skills.paths must be an array');
    }
    if (config.skills.urls && !Array.isArray(config.skills.urls)) {
      errors.push('skills.urls must be an array');
    }
  }
}

validateConfig();

if (errors.length > 0) {
  console.error('Config validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('Config validated successfully');
}
```

- [ ] **Step 4: Create validate-plugins.js**

```javascript
const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', '.opencode', 'plugins');

let errors = [];

function validatePlugin(pluginFile) {
  const content = fs.readFileSync(pluginFile, 'utf-8');

  // Check for default export
  if (!content.includes('export default')) {
    errors.push(`Missing default export in ${pluginFile}`);
  }

  // Check for Plugin type
  if (!content.includes('satisfies Plugin')) {
    errors.push(`Missing 'satisfies Plugin' type assertion in ${pluginFile}`);
  }

  // Check for hook registration
  const hookPatterns = [
    'config:',
    'chat.message',
    'chat.params',
    'chat.headers',
    'tool.execute.before',
    'tool.execute.after',
    'tool.definition',
    'command.execute.before',
    'shell.env',
    'permission.ask',
    'event',
  ];

  const hasHook = hookPatterns.some(pattern => content.includes(pattern));
  if (!hasHook) {
    errors.push(`No hooks registered in ${pluginFile}`);
  }
}

// Main
if (fs.existsSync(PLUGINS_DIR)) {
  const plugins = fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.ts'));

  plugins.forEach(plugin => validatePlugin(path.join(PLUGINS_DIR, plugin)));
}

if (errors.length > 0) {
  console.error('Plugin validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('All plugins validated successfully');
}
```

- [ ] **Step 5: Commit all validation scripts**

```bash
git add scripts/
git commit -m "feat: add validation scripts (skills, agents, config, plugins)"
```

---

## Task 8: Create Install Script

**Files:**
- Create: `install.sh`

- [ ] **Step 1: Create install.sh**

```bash
#!/bin/bash

# oh-see-flow installer
# Usage: curl -fsSL https://raw.githubusercontent.com/yanotoma/oh-see-flow/main/install.sh | bash

set -e

REPO_URL="https://raw.githubusercontent.com/yanotoma/oh-see-flow/main"
TEMP_DIR=$(mktemp -d)

echo "╔═══════════════════════════════════════╗"
echo "║        oh-see-flow installer          ║"
echo "║    pronounced: oh-see-flow             ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Cleanup on exit
trap "rm -rf $TEMP_DIR" EXIT

# Ask install location
echo "Where do you want to install?"
echo "  1) Project-local (.opencode/ in current directory)"
echo "  2) Global (~/.config/opencode/)"
read -p "Choice [1]: " install_choice
install_choice=${install_choice:-1}

if [ "$install_choice" = "2" ]; then
  INSTALL_DIR="$HOME/.config/opencode"
else
  INSTALL_DIR=".opencode"
fi

echo ""
echo "Installing to: $INSTALL_DIR"
echo ""

# Create directories
mkdir -p "$INSTALL_DIR/agents"
mkdir -p "$INSTALL_DIR/skills"
mkdir -p "$INSTALL_DIR/plugins"
mkdir -p ".osf"

# Download agents
echo "Downloading agents..."
for agent in orchestrator coder tester researcher reviewer debugger verifier; do
  curl -sL "$REPO_URL/.opencode/agents/$agent.md" -o "$INSTALL_DIR/agents/$agent.md"
  echo "  ✓ $agent"
done

# Download skills
echo ""
echo "Downloading skills..."
for skill in osf-debug osf-review osf-tdd osf-spark osf-blueprint osf-forge osf-ask-review osf-handle-review osf-preflight osf-swarm osf-isolate osf-ui-designer osf-ux-expert osf-tester osf-backend osf-frontend osf-devops osf-data osf-design-system osf-engram; do
  mkdir -p "$INSTALL_DIR/skills/$skill"
  curl -sL "$REPO_URL/.opencode/skills/$skill/SKILL.md" -o "$INSTALL_DIR/skills/$skill/SKILL.md"
  echo "  ✓ $skill"
done

# Download plugins
echo ""
echo "Downloading plugins..."
for plugin in engram-context.ts task-logger.ts result-collector.ts env-guard.ts model-stats.ts perf-monitor.ts capability-router.ts; do
  curl -sL "$REPO_URL/.opencode/plugins/$plugin" -o "$INSTALL_DIR/plugins/$plugin"
  echo "  ✓ $plugin"
done

# Capability model configuration
echo ""
echo "═══════════════════════════════════════"
echo "Capability Model Configuration"
echo "═══════════════════════════════════════"
echo ""
echo "Configure which models handle specific capabilities:"
echo ""

read -p "Model for vision/images [anthropic/claude-sonnet-4-6]: " vision_model
vision_model=${vision_model:-"anthropic/claude-sonnet-4-6"}

read -p "Model for large context [anthropic/claude-sonnet-4-6]: " context_model
context_model=${context_model:-"anthropic/claude-sonnet-4-6"}

read -p "Model for code execution [openai/gpt-4o]: " code_model
code_model=${code_model:-"openai/gpt-4o"}

# Save capability models config
cat > .osf/capability-models.json << EOF
{
  "vision": "$vision_model",
  "large_context": "$context_model",
  "code_execution": "$code_model"
}
EOF

echo ""
echo "Capability models saved to .osf/capability-models.json"

# MCP selection
echo ""
echo "═══════════════════════════════════════"
echo "MCP Configuration"
echo "═══════════════════════════════════════"
echo ""
echo "Select MCPs to configure (comma-separated numbers, or 'all'):"
echo "  1) Playwright - Browser automation"
echo "  2) GitHub - Issues, PRs, repos"
echo "  3) Sentry - Error monitoring"
echo "  4) n8n - Workflow automation"
echo "  5) Railway - Infrastructure"
echo "  6) Context7 - Documentation lookup"
echo "  7) Engram - Persistent memory"
echo "  8) Stitch - Design systems"
echo "  9) Cloudflare - Workers, DNS, CDN"
echo "  0) None"
read -p "Choice [0]: " mcp_choice
mcp_choice=${mcp_choice:-0}

# Build MCP config
MCP_CONFIG="{}"
if [ "$mcp_choice" != "0" ]; then
  MCP_CONFIG="{"
  if [[ "$mcp_choice" == *"1"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"playwright\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@playwright/mcp\"],\"enabled\":true},"
  fi
  if [[ "$mcp_choice" == *"3"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"sentry\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@sentry/mcp\"],\"enabled\":true},"
  fi
  if [[ "$mcp_choice" == *"4"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"n8n\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@n8n/mcp\"],\"enabled\":true},"
  fi
  if [[ "$mcp_choice" == *"5"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"railway\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@railway/mcp\"],\"enabled\":true},"
  fi
  if [[ "$mcp_choice" == *"6"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"context7\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@context7/mcp\"],\"enabled\":true},"
  fi
  if [[ "$mcp_choice" == *"7"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"engram\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@engram/mcp\"],\"enabled\":true},"
  fi
  if [[ "$mcp_choice" == *"8"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"stitch\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@stitch/mcp\"],\"enabled\":true},"
  fi
  if [[ "$mcp_choice" == *"9"* ]] || [ "$mcp_choice" = "all" ]; then
    MCP_CONFIG="$MCP_CONFIG\"cloudflare\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@cloudflare/mcp\"],\"enabled\":true},"
  fi
  # Remove trailing comma and close
  MCP_CONFIG="${MCP_CONFIG%,}}"
fi

# Generate opencode.json
echo ""
echo "Generating opencode.json..."
cat > opencode.json << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md"],
  "skills": {
    "paths": ["$INSTALL_DIR/skills"]
  },
  "agent": {
    "orchestrator": {
      "description": "Primary orchestrator — plans, decomposes, and delegates tasks to specialized subagents.",
      "mode": "primary"
    },
    "coder": {
      "description": "Implements code changes following project conventions and TDD practices.",
      "mode": "subagent"
    },
    "tester": {
      "description": "Writes and runs tests, reports coverage and quality.",
      "mode": "subagent"
    },
    "researcher": {
      "description": "Explores codebase, documentation, and web to gather context.",
      "mode": "subagent"
    },
    "reviewer": {
      "description": "Reviews code for quality, style, and potential issues.",
      "mode": "subagent"
    },
    "debugger": {
      "description": "Systematic debugging agent for diagnosing issues.",
      "mode": "subagent"
    },
    "verifier": {
      "description": "Validates that subagents completed their tasks correctly.",
      "mode": "subagent"
    }
  },
  "command": {
    "osf:grill": {
      "description": "Ask clarifying questions before planning",
      "prompt": "Ask clarifying questions to understand what the user wants to build. One question at a time. After understanding, suggest creating a plan with osf:plan."
    },
    "osf:plan": {
      "description": "Create an implementation plan",
      "prompt": "Create a detailed implementation plan. Break work into independent subtasks. For each subtask, specify which subagent should handle it."
    },
    "osf:execute": {
      "description": "Execute the plan via subagents",
      "prompt": "Ask the user which execution mode they want (auto, review-plan, step-by-step, dry-run, direct), then execute the plan accordingly."
    },
    "osf:review": {
      "description": "Review current changes",
      "prompt": "Review the current git diff for bugs, style issues, and improvements. Be specific about file and line numbers."
    },
    "osf:test": {
      "description": "Run tests and report",
      "prompt": "Run the project's tests and report results. If tests fail, suggest debugging with osf:debug."
    },
    "osf:debug": {
      "description": "Start systematic debugging",
      "prompt": "Use the osf-debug skill to systematically diagnose the issue."
    },
    "osf:deploy": {
      "description": "Deploy (requires explicit user confirmation)",
      "prompt": "Ask the user where they want to deploy (platform, project, environment) and how. Never deploy without explicit confirmation."
    },
    "osf:spec": {
      "description": "Generate a spec from requirements",
      "prompt": "Generate a specification document from the user's requirements. Include interfaces, contracts, and acceptance criteria."
    },
    "osf:ship": {
      "description": "Full flow: test → review → merge → deploy",
      "prompt": "Run the full flow: test, review, then ask user about merge/deploy. Never deploy without explicit confirmation."
    },
    "osf:finish": {
      "description": "Finish branch — merge/PR/keep/discard",
      "prompt": "All tasks complete. Present options: merge to main, create PR, keep branch, or discard. Let user choose."
    },
    "osf:refresh-registry": {
      "description": "Refresh skill discovery registry",
      "prompt": "Scan for skills in all known locations and regenerate the skill registry."
    }
  },
  "mcp": $MCP_CONFIG,
  "plugin": [
    "$INSTALL_DIR/plugins/engram-context.ts",
    "$INSTALL_DIR/plugins/task-logger.ts",
    "$INSTALL_DIR/plugins/result-collector.ts",
    "$INSTALL_DIR/plugins/env-guard.ts",
    "$INSTALL_DIR/plugins/model-stats.ts",
    "$INSTALL_DIR/plugins/perf-monitor.ts"
  ],
  "permission": {
    "bash": {
      "git *": "allow",
      "npm *": "allow",
      "rm *": "ask",
      "*": "ask"
    },
    "external_directory": {
      "~/**": "ask",
      "*": "ask"
    }
  }
}
EOF

# Download AGENTS.md
echo "Downloading AGENTS.md..."
curl -sL "$REPO_URL/AGENTS.md" -o "AGENTS.md"

# Download validation scripts
echo ""
echo "Downloading validation scripts..."
mkdir -p scripts
for script in validate-skills.js validate-agents.js validate-config.js validate-plugins.js; do
  curl -sL "$REPO_URL/scripts/$script" -o "scripts/$script"
  echo "  ✓ $script"
done

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
  echo ""
  echo "Creating package.json..."
  cat > package.json << EOF
{
  "name": "oh-see-flow",
  "version": "1.0.0",
  "scripts": {
    "validate": "node scripts/validate-config.js && node scripts/validate-agents.js && node scripts/validate-skills.js && node scripts/validate-plugins.js",
    "validate:config": "node scripts/validate-config.js",
    "validate:agents": "node scripts/validate-agents.js",
    "validate:skills": "node scripts/validate-skills.js",
    "validate:plugins": "node scripts/validate-plugins.js"
  },
  "license": "MIT"
}
EOF
fi

echo ""
echo "═══════════════════════════════════════"
echo "Installation complete!"
echo "═══════════════════════════════════════"
echo ""
echo "Installed:"
echo "  - 7 agents (orchestrator + 6 subagents)"
echo "  - 20 skills (11 workflow + 9 role)"
echo "  - 6 plugins"
echo "  - 4 validation scripts"
echo ""
echo "Next steps:"
echo "  1. Restart opencode to load the new config"
echo "  2. Run 'npm run validate' to verify installation"
echo "  3. Try 'osf:grill' to start brainstorming"
echo ""
echo "Documentation: https://github.com/yanotoma/oh-see-flow"
```

- [ ] **Step 2: Make install.sh executable**

```bash
chmod +x install.sh
```

- [ ] **Step 3: Commit**

```bash
git add install.sh
git commit -m "feat: add interactive install script"
```

---

## Task 9: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Update AGENTS.md with complete rules**

```markdown
# oh-see-flow

Custom workflow configuration for opencode.

## Global Rules

### Engram Memory Protocol
- Always use Engram memory to persist important decisions and learnings
- Save immediately after: bug fixes, architecture decisions, config changes, discoveries, patterns
- Search Engram before starting work that might have been done before
- Use stable topic keys: `sdd/<task>/decision`, `bug/<issue>/root-cause`, `code/<feature>/pattern`

### Safety Rules
- Never deploy without explicit user confirmation
- Never commit secrets, API keys, or credentials
- Run lint/typecheck after making changes when available
- Verify work before claiming completion

### Code Conventions
- Prefer editing existing files over creating new ones
- Follow existing code conventions in the project you're working on
- Be concise in responses — no unnecessary preamble
- Don't add code comments unless asked

### Workflow Principles
- YAGNI: You Aren't Gonna Need It — don't build what isn't asked for
- DRY: Don't Repeat Yourself — reuse existing code/patterns
- Human control: User has final say on all decisions
- Concepts before code: Design before implementation
- Artifacts over chat: Persist decisions to Engram
- Reviewable changes: Small, focused changes over giant diffs

### Delegation Rules
- Reading 4+ files → launch researcher subagent
- Touching 2+ non-trivial code files → use coder subagent
- Commit/push/PR → run fresh reviewer subagent
- Test failure → launch debugger subagent
- New feature → orchestrator plans, then delegates
- Bug report → debugger first, then coder to fix
- Deployment → require explicit user confirmation

### Two-Stage Review
Every code change goes through two review stages:
1. Spec compliance — Does the output match what was planned?
2. Code quality — Is the code clean, correct, and maintainable?

### Orchestrator Contract
The orchestrator is responsible for:
1. Planning — Create the plan before any work
2. Memory retrieval — Check Engram for relevant past decisions
3. Context assembly — Gather relevant context for each subagent
4. Delegation — Route tasks to the right subagent
5. Result chaining — Pass results between subagents
6. Verification — Ensure verifier runs after each subagent
7. Memory persistence — Save important decisions to Engram
8. User communication — Report progress, ask for input when stuck

The orchestrator should NOT:
- Do coding work itself (delegate to coder)
- Run tests itself (delegate to tester)
- Review its own work (delegate to reviewer)
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with complete rules"
```

---

## Task 10: Update opencode.json

**Files:**
- Modify: `opencode.json`

- [ ] **Step 1: Update opencode.json with full configuration**

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md"],
  "skills": {
    "paths": [".opencode/skills"]
  },
  "agent": {
    "orchestrator": {
      "description": "Primary orchestrator — plans, decomposes, and delegates tasks to specialized subagents.",
      "mode": "primary"
    },
    "coder": {
      "description": "Implements code changes following project conventions and TDD practices.",
      "mode": "subagent"
    },
    "tester": {
      "description": "Writes and runs tests, reports coverage and quality.",
      "mode": "subagent"
    },
    "researcher": {
      "description": "Explores codebase, documentation, and web to gather context.",
      "mode": "subagent"
    },
    "reviewer": {
      "description": "Reviews code for quality, style, and potential issues.",
      "mode": "subagent"
    },
    "debugger": {
      "description": "Systematic debugging agent for diagnosing issues.",
      "mode": "subagent"
    },
    "verifier": {
      "description": "Validates that subagents completed their tasks correctly.",
      "mode": "subagent"
    }
  },
  "command": {
    "osf:grill": {
      "description": "Ask clarifying questions before planning",
      "prompt": "Ask clarifying questions to understand what the user wants to build. One question at a time. After understanding, suggest creating a plan with osf:plan."
    },
    "osf:plan": {
      "description": "Create an implementation plan",
      "prompt": "Create a detailed implementation plan. Break work into independent subtasks. For each subtask, specify which subagent should handle it."
    },
    "osf:execute": {
      "description": "Execute the plan via subagents",
      "prompt": "Ask the user which execution mode they want (auto, review-plan, step-by-step, dry-run, direct), then execute the plan accordingly."
    },
    "osf:review": {
      "description": "Review current changes",
      "prompt": "Review the current git diff for bugs, style issues, and improvements. Be specific about file and line numbers."
    },
    "osf:test": {
      "description": "Run tests and report",
      "prompt": "Run the project's tests and report results. If tests fail, suggest debugging with osf:debug."
    },
    "osf:debug": {
      "description": "Start systematic debugging",
      "prompt": "Use the osf-debug skill to systematically diagnose the issue."
    },
    "osf:deploy": {
      "description": "Deploy (requires explicit user confirmation)",
      "prompt": "Ask the user where they want to deploy (platform, project, environment) and how. Never deploy without explicit confirmation."
    },
    "osf:spec": {
      "description": "Generate a spec from requirements",
      "prompt": "Generate a specification document from the user's requirements. Include interfaces, contracts, and acceptance criteria."
    },
    "osf:ship": {
      "description": "Full flow: test → review → merge → deploy",
      "prompt": "Run the full flow: test, review, then ask user about merge/deploy. Never deploy without explicit confirmation."
    },
    "osf:finish": {
      "description": "Finish branch — merge/PR/keep/discard",
      "prompt": "All tasks complete. Present options: merge to main, create PR, keep branch, or discard. Let user choose."
    },
    "osf:refresh-registry": {
      "description": "Refresh skill discovery registry",
      "prompt": "Scan for skills in all known locations and regenerate the skill registry."
    }
  },
  "mcp": {},
  "plugin": [
    ".opencode/plugins/engram-context.ts",
    ".opencode/plugins/task-logger.ts",
    ".opencode/plugins/result-collector.ts",
    ".opencode/plugins/env-guard.ts",
    ".opencode/plugins/model-stats.ts",
    ".opencode/plugins/perf-monitor.ts"
  ],
  "permission": {
    "bash": {
      "git *": "allow",
      "npm *": "allow",
      "rm *": "ask",
      "*": "ask"
    },
    "external_directory": {
      "~/**": "ask",
      "*": "ask"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add opencode.json
git commit -m "feat: update opencode.json with full configuration"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run all validators**

```bash
npm run validate
```

Expected: All validators pass

- [ ] **Step 2: Verify file structure**

```bash
find .opencode -type f | sort
find scripts -type f | sort
```

Expected: All files present

- [ ] **Step 3: Commit final state**

```bash
git add -A
git commit -m "chore: final verification and cleanup"
```

---

## Plan Summary

| Task | Description | Files Created/Modified |
|------|-------------|----------------------|
| 1 | Project setup | package.json, .gitignore |
| 2 | Orchestrator agent | .opencode/agents/orchestrator.md |
| 3 | Subagent agents | 9 agent .md files (including capability subagents) |
| 4 | Workflow skills | 11 SKILL.md files |
| 5 | Role skills | 9 SKILL.md files |
| 6 | Plugins | 7 .ts files (including capability-router) |
| 7 | Validation scripts | 4 .js files |
| 8 | Install script | install.sh |
| 9 | AGENTS.md | Updated rules |
| 10 | opencode.json | Updated config |
| 11 | Final verification | Run validators |

**Total files:** 10 agents + 20 skills + 7 plugins + 4 scripts + 1 installer + 2 config files = **44 files**

**Key Features:**
- Orchestrator-driven multi-agent workflow
- Capability-based subagents (vision, context-builder, code-runner)
- Engram memory sharing between agents
- Interactive installer with MCP and capability model selection
- Validation scripts for project structure
