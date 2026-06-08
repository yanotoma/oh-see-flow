# oh-see-flow

Custom workflow configuration for [opencode](https://opencode.ai).

Pronounced: **oh-see-flow**

## Why oh-see-flow?

Most AI coding sessions fail for operational reasons, not model reasons:

- The agent jumps into code before requirements are clear
- Architectural decisions disappear into chat history
- One request quietly becomes a huge multi-area diff
- Tests run late, or not at all
- Reviewers get handed a wall of changes
- Subagents are available, but the parent session has no orchestration discipline
- Project skills exist, but the model forgets to load them

**oh-see-flow fixes the workflow around the agent.**

It provides:
- An **orchestrator** that plans before acting
- **Specialized subagents** for each type of work
- **Persistent memory** via Engram that survives sessions
- **Capability-based routing** for handling images, large context, and code execution
- **Verification gates** that catch mistakes before they compound

## Design Philosophy

### Why TDD?

Test-Driven Development (RED-GREEN-REFACTOR) is the foundation of reliable code:

1. **RED**: Write a failing test that describes expected behavior
2. **GREEN**: Write the minimum code to make it pass
3. **REFACTOR**: Improve without changing behavior

Why this matters for AI agents:
- Tests define "done" — the agent knows exactly when it's complete
- Tests prevent regressions — changes that break things are caught immediately
- Tests document intent — future sessions understand what the code does
- Tests enable confidence — the agent can refactor without fear

### Why Hybrid (TDD + OpenSpecs)?

Pure TDD works for implementation, but doesn't address **planning**. Pure OpenSpecs works for contracts, but doesn't enforce **implementation quality**.

oh-see-flow combines both:

| Phase | Approach | What it provides |
|-------|----------|-----------------|
| Planning | OpenSpecs-style | Requirements, interfaces, contracts, acceptance criteria |
| Implementation | TDD | Failing tests first, minimal code, refactoring |
| Verification | Both | Spec compliance + test passing |

The orchestrator decides which approach per task:
- Simple fixes → TDD directly
- Multi-service features → Spec first, then TDD
- Architecture decisions → Spec only (no code yet)

### Why an Orchestrator?

Without orchestration, agents:
- Jump into coding without understanding the problem
- Create monolithic changes that are hard to review
- Miss dependencies between tasks
- Forget to verify their work

The orchestrator:
1. **Plans** before any work begins
2. **Decomposes** into independent subtasks
3. **Routes** each subtask to the right specialist
4. **Chains** results between subagents
5. **Verifies** each step before moving on

### Why Capability-Based Subagents?

Different tasks need different capabilities:

| Capability | Problem | Solution |
|------------|---------|----------|
| Vision | Model can't process images | `vision` subagent with vision-capable model |
| Large context | Model hits context limits | `context-builder` subagent with larger context |
| Code execution | Model can't run code | `code-runner` subagent with execution tools |

The user configures which model handles each capability during install. When the main model encounters something it can't handle, the orchestrator automatically dispatches the right subagent.

### Why Engram?

Chat history is ephemeral. When a session ends, all context is lost.

Engram provides:
- **Persistent memory** across sessions
- **Full-text search** of past decisions
- **Topic-based organization** (bug patterns, design decisions, gotchas)
- **Session lifecycle** management

oh-see-flow uses Engram for:
- Saving decisions and discoveries automatically
- Searching for relevant past work before starting
- Sharing context between subagents
- Recovering context after compaction

## What's Inside

```
├── opencode.json              # Main config (MCPs, plugins, agents, commands)
├── AGENTS.md                  # Global rules and instructions
├── .opencode/
│   ├── agents/
│   │   ├── orchestrator.md    # Primary agent — plans and delegates
│   │   ├── coder.md           # Implements code changes
│   │   ├── tester.md          # Writes and runs tests
│   │   ├── researcher.md      # Explores codebase, docs, web
│   │   ├── reviewer.md        # Reviews code quality
│   │   ├── debugger.md        # Systematic debugging
│   │   ├── verifier.md        # Validates subagent output
│   │   ├── vision.md          # Image processing
│   │   ├── context-builder.md # Large context handling
│   │   └── code-runner.md     # Code execution
│   ├── skills/
│   │   ├── osf-debug/         # Systematic debugging workflow
│   │   ├── osf-review/        # Code review workflow
│   │   ├── osf-tdd/           # Test-driven development
│   │   ├── osf-spark/         # Brainstorming and exploration
│   │   ├── osf-blueprint/     # Implementation planning
│   │   ├── osf-ui-designer/   # UI design best practices
│   │   ├── osf-ux-expert/     # UX best practices
│   │   ├── osf-tester/        # Testing strategy
│   │   ├── osf-backend/       # API/backend patterns
│   │   ├── osf-frontend/      # Frontend patterns
│   │   ├── osf-devops/        # CI/CD and infrastructure
│   │   ├── osf-data/          # Data modeling and queries
│   │   ├── osf-design-system/ # Design systems and DESIGN.md
│   │   └── osf-engram/        # Engram memory protocol
│   └── plugins/
│       ├── engram-context.ts  # Auto-inject Engram memories
│       ├── task-logger.ts     # Log orchestrator decisions
│       ├── result-collector.ts # Format subagent results
│       ├── env-guard.ts       # Block secrets from leaking
│       ├── model-stats.ts     # Track token usage
│       ├── perf-monitor.ts    # Track tokens/second
│       └── capability-router.ts # Auto-dispatch capability subagents
├── scripts/
│   ├── validate-skills.js     # Validate SKILL.md files
│   ├── validate-agents.js     # Validate agent .md files
│   ├── validate-config.js     # Validate opencode.json
│   └── validate-plugins.js    # Validate plugin files
└── install.sh                 # Interactive installer
```

## Quick Start

### Prerequisites

- [opencode](https://opencode.ai) installed
- [Engram](https://github.com/Gentleman-Programming/engram) installed:
  ```bash
  brew install gentleman-programming/tap/engram
  ```
- Node.js 18+ (for npm-based MCPs)

### Install

```bash
curl -fsSL https://raw.githubusercontent.com/yanotoma/oh-see-flow/main/install.sh | bash
```

The installer will:
1. Ask where to install (project or global)
2. Configure capability models (vision, large context, code execution)
3. Let you select which MCPs to configure
4. Check prerequisites for selected MCPs
5. Generate your `opencode.json`

### Verify

```bash
npm run validate
```

### Start

```bash
# Restart opencode, then:
osf:grill
```

## Commands

All commands prefixed with `osf:`

| Command | Description |
|---------|-------------|
| `osf:grill` | Ask clarifying questions before planning |
| `osf:plan` | Orchestrator creates a plan for a task |
| `osf:execute` | Execute the plan via subagents |
| `osf:review` | Review current changes |
| `osf:test` | Run tests and report |
| `osf:debug` | Start systematic debugging |
| `osf:deploy` | Deploy (requires explicit user confirmation) |
| `osf:spec` | Generate a spec from requirements |
| `osf:ship` | Full flow: test → review → merge → deploy |
| `osf:finish` | Finish branch — merge/PR/keep/discard |
| `osf:refresh-registry` | Refresh skill discovery registry |

## Workflow

```
osf:grill → osf:plan → osf:execute → osf:ship
   ↓           ↓           ↓            ↓
Questions    Plan      Subagents    Deploy
  & Ideas   & Spec     & Verify    (with confirmation)
```

### Execution Modes

When you run `osf:execute`, you choose how much control you want:

| Mode | Behavior |
|------|----------|
| `auto` | Orchestrator plans and executes automatically |
| `review-plan` | You review the plan, then execution proceeds |
| `step-by-step` | You approve each subtask before it runs |
| `dry-run` | Plan only, no execution |
| `direct` | Skip orchestrator, pick subagent manually |

### Two-Stage Review

Every code change goes through:
1. **Spec compliance** — Does the output match what was planned?
2. **Code quality** — Is the code clean, correct, and maintainable?

### Failure Handling

When a subagent fails:
1. First attempt fails → retry with error feedback
2. Second attempt fails → escalate to orchestrator to re-plan
3. Orchestrator stuck → ask the user

## Skills

### Workflow Skills (Core)
- `osf-debug` — Systematic debugging
- `osf-review` — Code review
- `osf-tdd` — Test-driven development
- `osf-spark` — Brainstorming
- `osf-blueprint` — Implementation planning
- `osf-forge` — Skill creation
- `osf-ask-review` — Request review
- `osf-handle-review` — Process feedback
- `osf-preflight` — Pre-completion checks
- `osf-swarm` — Parallel subagents
- `osf-isolate` — Git worktree isolation

### Role Skills (Domain Expertise)
- `osf-ui-designer` — UI and component design
- `osf-ux-expert` — User experience
- `osf-tester` — Testing strategy
- `osf-backend` — API/backend patterns
- `osf-frontend` — Frontend patterns
- `osf-devops` — CI/CD and infrastructure
- `osf-data` — Data modeling
- `osf-design-system` — Design systems
- `osf-engram` — Memory protocol

## Available MCPs

Select during install:

| MCP | Purpose | Prerequisites |
|-----|---------|---------------|
| Playwright | Browser automation | `npx playwright install` |
| GitHub | Issues, PRs, repos | Built-in |
| Sentry | Error monitoring | Sentry account |
| n8n | Workflow automation | n8n instance |
| Railway | Infrastructure | Railway account |
| Context7 | Documentation lookup | None |
| Engram | Persistent memory | `brew install gentleman-programming/tap/engram` |
| Stitch | Design systems | Google account |
| Cloudflare | Workers, DNS, CDN | Cloudflare account |

## Credits

oh-see-flow is inspired by and builds on the work of these open source projects:

- [opencode](https://opencode.ai) — The AI coding agent platform
- [obra/superpowers](https://github.com/obra/superpowers) — Skills-based development methodology, TDD workflow, subagent-driven development
- [Gentleman-Programming/gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) — SDD/OpenSpec flow, skill discovery, orchestrator contract, memory delegation
- [Gentleman-Programming/engram](https://github.com/Gentleman-Programming/engram) — Persistent memory across sessions
- [Playwright](https://playwright.dev) — Browser automation
- [Sentry](https://sentry.io) — Error monitoring
- [n8n](https://n8n.io) — Workflow automation
- [Railway](https://railway.app) — Infrastructure
- [Context7](https://context7.dev) — Documentation lookup
- [Stitch](https://stitch.withgoogle.com) — Design systems
- [Cloudflare](https://cloudflare.com) — Workers/CDN

## License

MIT
