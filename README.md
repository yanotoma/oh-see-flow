# oh-see-flow

Custom workflow configuration for [opencode](https://opencode.ai).

Pronounced: **oh-see-flow**

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
│   ├── validate-design.js     # Validate DESIGN.md structure
│   ├── validate-skills.js     # Validate SKILL.md files
│   ├── validate-agents.js     # Validate agent .md files
│   ├── validate-config.js     # Validate opencode.json
│   └── validate-plugins.js    # Validate plugin files
└── install.sh                 # Interactive installer
```

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/yanotoma/oh-see-flow/main/install.sh | bash
```

The installer will:
1. Ask where to install (project or global)
2. Let you select which MCPs to configure
3. Let you select which plugins to install
4. Configure your model preferences
5. Generate your `opencode.json`

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

## Validation

Run validators to check project structure:

```bash
npm run validate          # Run all validators
npm run validate:skills   # Validate skills only
npm run validate:agents   # Validate agents only
npm run validate:config   # Validate config only
```

## Workflow

```
osf:grill → osf:plan → osf:execute → osf:ship
   ↓           ↓           ↓            ↓
Questions    Plan      Subagents    Deploy
  & Ideas   & Spec     & Verify    (with confirmation)
```

## Skills

### Workflow Skills
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

### Role Skills
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

| MCP | Purpose |
|-----|---------|
| Playwright | Browser automation |
| GitHub | Issues, PRs, repos |
| Sentry | Error monitoring |
| n8n | Workflow automation |
| Railway | Infrastructure |
| Context7 | Documentation lookup |
| Engram | Persistent memory |
| Stitch | Design systems |
| Cloudflare | Workers, DNS, CDN |

## Credits

oh-see-flow builds on the work of these open source projects:

- [opencode](https://opencode.ai) — The AI coding agent platform
- [Engram](https://github.com/obra/engram) — Persistent memory
- [Playwright](https://playwright.dev) — Browser automation
- [Sentry](https://sentry.io) — Error monitoring
- [n8n](https://n8n.io) — Workflow automation
- [Railway](https://railway.app) — Infrastructure
- [Context7](https://context7.dev) — Documentation lookup
- [Stitch](https://stitch.withgoogle.com) — Design systems
- [Cloudflare](https://cloudflare.com) — Workers/CDN

## License

MIT
