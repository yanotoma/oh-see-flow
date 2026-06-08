# oh-see-flow — Design Spec (WIP)

> Last updated: 2026-06-08
> Status: Collecting requirements

## Project Overview

**oh-see-flow** (pronounced "oh-see-flow") is a custom workflow configuration for opencode that provides an orchestrator-driven, multi-agent development workflow with shared memory via Engram.

## Core Architecture

### Orchestrator Agent (Primary)
- Acts as **planner and router**
- Receives user tasks
- Creates a plan (mini spec) first
- Decomposes into subtasks
- Routes each subtask to the appropriate subagent
- Chains results between subagents

### Subagents (Delegated)
All coding, testing, research, verification, review, and debugging tasks are delegated to specialized subagents:

| Subagent | Role |
|----------|------|
| `coder` | Implements code changes |
| `tester` | Writes and runs tests |
| `researcher` | Explores codebase, docs, web |
| `reviewer` | Reviews code quality and style |
| `debugger` | Systematic debugging |
| `verifier` | Validates subagent output |
| `vision` | Processes images, screenshots, diagrams |
| `context-builder` | Handles large documents/files exceeding context limits |
| `code-runner` | Executes code, runs scripts |

### Verifier Agent (Quality Gate)
Validates that each subagent actually completed its task. Checks:
1. **Output exists and is reasonable** — Did it produce something meaningful?
2. **Tests pass** — Run tests if code was written
3. **Lint/typecheck clean** — No new warnings or errors
4. **Task matches output** — Does result address what was asked?
5. **Memory was written** — Did subagent persist important discoveries to Engram?

If verification fails → kicks back to subagent with specifics.

## Rules

### Global Rules (AGENTS.md)
Always active, applies to all agents:

| Rule | Purpose |
|------|---------|
| Engram memory protocol | When to save, search, session lifecycle |
| No auto-deploy | Never deploy without explicit user confirmation |
| No secrets | Never commit/log API keys, tokens, credentials |
| Follow conventions | Match existing code patterns in the project |
| Verify before claiming done | Run checks before saying "complete" |
| Edit over create | Prefer editing existing files over creating new ones |
| Concise responses | No unnecessary preamble or explanation |
| No unnecessary comments | Don't add code comments unless asked |

### Orchestrator Rules (.opencode/agents/orchestrator.md)
How the primary agent behaves:

| Rule | Purpose |
|------|---------|
| Plan first | Always create a plan before delegating |
| Decompose | Break work into independent subtasks |
| Route by type | Send each subtask to the right subagent |
| Chain results | Pass context between subagents |
| Retry once | On failure, retry with feedback, then escalate |
| Ask user | If stuck after escalation, ask the user |
| Check Engram | Search memory for relevant past decisions |
| Write to Engram | Persist important decisions and learnings |

### Subagent Rules (per agent .md)
How subagents behave:

| Rule | Purpose |
|------|---------|
| Return structured results | Result + next-step suggestion + Engram write |
| Write to Engram | Persist important discoveries (bug patterns, gotchas) |
| Stay in scope | Only do what was asked, nothing extra |
| Report failures clearly | Specific error messages, not vague |
| Check Engram first | Search memory before starting work |
| Follow project conventions | Match existing code style and patterns |
| Run verification | Tests pass, lint clean before reporting done |

### Verifier Rules (.opencode/agents/verifier.md)
How the quality gate works:

| Rule | Purpose |
|------|---------|
| Check all 5 criteria | Output, tests, lint, task match, memory |
| Be specific on failure | "Tests failed at line X" not "tests failed" |
| Allow retry | Give subagent chance to fix before escalating |
| Log verification | Record pass/fail for debugging |
| Don't block on style | Only fail on functional issues, suggest style fixes |

### Safety Rules (opencode.json permissions)

| Rule | Purpose |
|------|---------|
| No auto-deploy | `osf:deploy` and `osf:ship` require user confirmation |
| No secret leakage | env-guard plugin blocks secrets in output |
| Permission boundaries | Per-agent permission limits |
| External directory deny | Default deny for directories outside project |
| Bash restrictions | Default ask for destructive commands (rm, mv, etc.) |

### Rules Location

| Rules | Location |
|-------|----------|
| Global rules | `AGENTS.md` |
| Orchestrator rules | `.opencode/agents/orchestrator.md` (in prompt) |
| Subagent rules | Each agent's `.md` file |
| Verifier rules | `.opencode/agents/verifier.md` |
| Safety rules | `opencode.json` (permissions) + `AGENTS.md` |

### Additional Principles (from Superpowers + Gentle AI)

| Principle | Rule |
|-----------|------|
| YAGNI | You Aren't Gonna Need It — don't build what isn't asked for |
| DRY | Don't Repeat Yourself — reuse existing code/patterns |
| Human control | User has final say on all decisions |
| Concepts before code | Design before implementation |
| Artifacts over chat | Persist decisions to Engram, not floating in chat |
| Reviewable changes | Small, focused changes over giant diffs |

## Delegation Triggers

Specific rules for when to delegate vs do inline:

| Trigger | Expected Behavior |
|---------|-------------------|
| Reading 4+ files to understand a flow | Launch researcher subagent |
| Touching 2+ non-trivial code files | Use coder subagent, require fresh review |
| Commit, push, or PR after code changes | Run fresh reviewer subagent |
| Wrong cwd, worktree accident, merge recovery | Stop and run audit reviewer |
| Long session with accumulating complexity | Pause and delegate or explain why |
| Test failure | Launch debugger subagent |
| New feature request | Orchestrator plans, then delegates |
| Bug report | Debugger first, then coder to fix |
| Review request | Reviewer subagent with fresh context |
| Deployment request | Require explicit user confirmation |

## Two-Stage Review

Every code change goes through two review stages:

1. **Spec compliance** — Does the output match what was planned?
2. **Code quality** — Is the code clean, correct, and maintainable?

Both stages must pass before the orchestrator considers a task complete.

## Finishing a Branch

When all tasks are complete, orchestrator presents options:

| Option | What happens |
|--------|-------------|
| Merge | Merge to main/parent branch |
| PR | Create pull request for review |
| Keep | Keep branch for further work |
| Discard | Delete branch and changes |

User explicitly chooses. No auto-merge.

## Skill Discovery Registry

Scans multiple locations for skills:

**Project locations:**
- `.opencode/skills/`
- `.claude/skills/`
- `.gemini/skills/`
- `.cursor/skills/`
- `.codex/skills/`
- `.agent/skills/`
- `.agents/skills/`

**Global locations:**
- `~/.config/opencode/skills/`
- `~/.claude/skills/`
- `~/.agents/skills/`

Registry file: `.osf/skill-registry.md` (auto-generated, gitignored)

Behavior:
- Refreshes on session start
- Indexes skill names, descriptions, paths
- Helps orchestrator find the right skill for a task
- `/osf:refresh-registry` to force regeneration

## Orchestrator Contract

The orchestrator (parent session) is responsible for:

1. **Planning** — Create the plan before any work
2. **Memory retrieval** — Check Engram for relevant past decisions
3. **Context assembly** — Gather relevant context for each subagent
4. **Delegation** — Route tasks to the right subagent
5. **Result chaining** — Pass results between subagents
6. **Verification** — Ensure verifier runs after each subagent
7. **Memory persistence** — Save important decisions to Engram
8. **User communication** — Report progress, ask for input when stuck

The orchestrator should NOT:
- Do coding work itself (delegate to coder)
- Run tests itself (delegate to tester)
- Review its own work (delegate to reviewer)

## Memory Delegation Contract

How memory flows between orchestrator and subagents:

| Agent | Memory Responsibility |
|-------|----------------------|
| Orchestrator | Retrieves relevant memories before planning, saves decisions |
| Coder | Saves bug patterns, gotchas, design decisions |
| Tester | Saves test patterns, coverage gaps |
| Reviewer | Saves code quality patterns |
| Debugger | Saves root causes, fix patterns |
| Researcher | Saves discoveries, documentation links |
| Verifier | Saves verification results |

**Rules:**
- Orchestrator passes selected memory context to subagent prompts
- Subagents save significant discoveries before returning
- Subagents should NOT independently search memory unless instructed
- Use stable topic keys: `sdd/<task>/decision`, `bug/<issue>/root-cause`, etc.

## Design Decisions

### Decision 1: Orchestrator Strategy
**Choice: Plan-then-decompose + task-type routing + fast path (Option 3 + optimization)**
- Orchestrator first creates a plan
- Then breaks plan into subtasks
- Routes each subtask to the appropriate subagent based on task type
- **Fast path**: Simple tasks skip orchestrator and go directly to the right subagent
- Orchestrator decides: "Is this simple enough to route directly, or does it need planning?"

| Task Type | Path | Token Cost |
|-----------|------|------------|
| "Fix this typo" | Direct → coder | Low |
| "Add auth to this API" | Orchestrator → plan → delegate | Medium |
| "Build a dashboard" | Orchestrator → plan → multiple subagents | Higher, each focused |

**Token optimizations:**
- Cheaper models for simpler tasks (haiku for testing, sonnet for coding)
- Focused context per subagent (not full conversation history)
- Engram persistence (don't re-explore what's already learned)
- Early verification (catches mistakes before wasting tokens)
- Tool restriction per subagent (fewer tool definitions = smaller context)
- Progressive context (minimal context, request more only if stuck)

### Decision 2: Subagent Reporting
**Choice: Full reporting (Option 4)**
- Subagents return: result + next-step suggestion + Engram memory write
- Subagents write to Engram when they discover something important (bug pattern, design decision, gotcha)
- Structured results so orchestrator can chain work intelligently

### Decision 3: Verifier
**Choice: Full verification (all checks)**
- Output exists and is reasonable
- Tests pass
- Lint/typecheck clean
- Task matches output
- Memory was written when relevant
- Mechanical checks (tests, lint) + lightweight reasoning pass

### Decision 4: Model Strategy
**Choice: Default model + capability-based subagents**
- Define a `default_model` in config for main orchestrator and general subagents
- **Capability-based subagents**: Specialized subagents for specific capabilities (vision, large context, code execution)
- Install script asks user to configure which model handles each capability

**Capability subagents:**
| Capability | Subagent | Purpose |
|------------|----------|---------|
| Vision/images | `vision` | Process images, screenshots, diagrams |
| Large context | `context-builder` | Handle documents/files that exceed normal context |
| Code execution | `code-runner` | Execute code, run scripts |

**Install-time configuration:**
```
What model for vision/images? [default: anthropic/claude-sonnet-4-6]
What model for large context? [default: anthropic/claude-sonnet-4-6]
What model for code execution? [default: openai/gpt-4o]
```

**Runtime flow:**
1. Main model encounters image in prompt
2. Main model can't process it (capability error)
3. Orchestrator detects capability mismatch
4. Dispatches `vision` subagent with configured vision model
5. Vision subagent processes image, returns result
6. Orchestrator continues with the result

**Config example:**
```json
{
  "capability_models": {
    "vision": "anthropic/claude-sonnet-4-6",
    "large_context": "anthropic/claude-sonnet-4-6",
    "code_execution": "openai/gpt-4o"
  }
}
```

**Capability detection:**
| Capability | How to Detect | Fallback |
|------------|---------------|----------|
| Image input | Model returns error or "I can't process images" | Dispatch vision subagent |
| Large context | Model hits context limit | Dispatch context-builder subagent |
| Code execution | Model can't run code | Dispatch code-runner subagent |

**Fallback behavior:**
1. Plugin detects capability error in model response
2. Checks if capability model is configured in `.osf/capability-models.json`
3. If yes: dispatches capability subagent with configured model
4. If no: logs error and asks user for guidance
5. Logs the dispatch for optimization

| Agent | Suggested Model Tier |
|-------|---------------------|
| Orchestrator/Planner | High (claude-sonnet, gpt-4o) |
| Coder | Medium-high (claude-sonnet, gpt-4o) |
| Tester | Medium (claude-haiku, gpt-4o-mini) |
| Verifier | Low-medium (claude-haiku, gpt-4o-mini) |
| Researcher | Medium (claude-sonnet, gpt-4o) |
| Reviewer | Medium-high (claude-sonnet, gpt-4o) |
| Debugger | High (claude-sonnet, gpt-4o) |
| Vision | User-configured (install-time) |
| Context-builder | User-configured (install-time) |
| Code-runner | User-configured (install-time) |

### Decision 5: Failure Handling
**Choice: Retry once, then escalate (Option 3)**
- Most failures are transient → retry with error feedback
- If still stuck → escalate to orchestrator to re-plan
- Orchestrator can ask user as final fallback

### Decision 6: Capability Routing
**Choice: Capability-based subagents with install-time model configuration**
- Capability-router plugin detects when model can't handle input (images, large context, code execution)
- Dispatches specialized subagent with configured model
- Install script asks user to configure which model handles each capability
- Logs all capability dispatches for optimization

### Decision 7: Context Sharing
**Choice: Orchestrator context + Engram (Option 4)**
- Orchestrator passes immediate context between subagents
- Subagents also check Engram for relevant history
- Best of both: immediate handoff + persistent knowledge

### Decision 7: Methodology
**Choice: Hybrid (TDD + OpenSpecs)**
- Planning phase: Orchestrator creates lightweight spec (what to build, interfaces, contracts)
- Implementation phase: Subagents use TDD (write tests first, then implement)
- Verification phase: Verifier checks both spec compliance AND test passing
- Orchestrator decides which approach per task

### Decision 8: Execution Control
**Choice: User-controlled execution modes**
Before `osf:execute` runs, the user chooses the execution mode:

| Mode | What happens | When to use |
|------|-------------|-------------|
| `auto` | Orchestrator plans and executes automatically | Simple tasks, trusted workflow |
| `review-plan` | Orchestrator plans, user reviews plan, then executes | Most tasks — see the plan first |
| `step-by-step` | Orchestrator plans, user approves each subtask before execution | Complex tasks, learning the workflow |
| `dry-run` | Orchestrator plans only, no execution | Planning, estimation, discussion |
| `direct` | Skip orchestrator, user picks subagent manually | Simple tasks, full control |

**How it works:**
1. User runs `osf:execute` or `osf:ship`
2. Agent asks: "How do you want to run this?"
3. User picks mode
4. Agent proceeds accordingly

This gives the user full control over how much automation they want.

## Installation

### Shell Script Install (Interactive)
- One-command install via `curl | bash`
- No dependencies required
- Copies agents, skills, config to appropriate opencode locations
- Supports `update` command later

### Install Modes
- **Project-local**: Copy to `.opencode/` in current project
- **Global**: Copy to `~/.config/opencode/`
- **Selective**: Install specific agents/skills only

### Install Flow
1. User runs `curl -fsSL https://raw.githubusercontent.com/yanotoma/oh-see-flow/main/install.sh | bash`
2. Script asks: Install to project or global?
3. Script lists available MCPs with descriptions → user selects
4. Script lists available plugins → user selects
5. Script asks for model preferences (default + overrides)
6. Script generates config and copies files
7. Reminds user to restart opencode

## MCPs (Selection-Based Installer)

All available MCPs, user selects which to configure during install:

| MCP | Purpose | Package/Source |
|-----|---------|---------------|
| **Playwright** | Browser automation, UI testing | `@playwright/mcp` |
| **GitHub** | Issues, PRs, repos | Built-in to opencode |
| **Sentry** | Error monitoring, debugging production | `@sentry/mcp` |
| **n8n** | Workflow automation | `@n8n/mcp` |
| **Railway** | Infrastructure, deployments | `@railway/mcp` |
| **Context7** | Documentation lookup | `@context7/mcp` |
| **Engram** | Persistent memory (shared across sessions) | `@engram/mcp` |
| **Stitch** | Design systems, UI generation | `@stitch/mcp` |
| **Cloudflare** | Workers, DNS, CDN | `@cloudflare/mcp` |

Installer flow:
1. List all available MCPs with descriptions
2. User selects which to enable (checkboxes)
3. For each selected MCP, prompt for required credentials/config
4. Generate `opencode.json` with selected MCPs configured

## Custom Commands

All commands prefixed with `osf:`

| Command | Description |
|---------|-------------|
| `osf:grill` | Ask clarifying questions before planning (brainstorming phase) |
| `osf:plan` | Orchestrator creates a plan for a task |
| `osf:review` | Review current changes |
| `osf:test` | Run tests and report |
| `osf:debug` | Start systematic debugging |
| `osf:deploy` | Deploy via Railway/Cloudflare |
| `osf:spec` | Generate a spec from requirements |
| `osf:execute` | Execute the plan via subagents |
| `osf:ship` | Full flow: test → review → merge → deploy |
| `osf:finish` | Finish branch — merge/PR/keep/discard |
| `osf:refresh-registry` | Refresh skill discovery registry |

**Command flow**: User says `osf:grill` → agent asks questions → user says `osf:plan` → orchestrator plans → `osf:execute` runs it (user picks execution mode) → `osf:ship` for end-to-end.

**Safety**: `osf:deploy` and `osf:ship` NEVER deploy automatically. They require:
1. User explicitly specifies where to deploy (platform, project, environment)
2. User explicitly specifies how (config, env vars, commands)
3. Agent confirms the deployment plan with user before executing
4. Only proceeds after user says "yes" or "go"

## Plugins

All plugins included, installed via the plugin system:

| Plugin | Purpose |
|--------|---------|
| **engram-context** | Auto-inject relevant Engram memories into subagent prompts |
| **task-logger** | Log all orchestrator decisions and subagent results to file |
| **result-collector** | Gather and format subagent results for orchestrator |
| **env-guard** | Block secrets from leaking into logs or outputs |
| **model-stats** | Track token usage per agent per task |
| **perf-monitor** | Track tokens/second, latency, throughput per agent |
| **capability-router** | Detect model capability errors and fallback to capable model or subagent |

Plugin installation: Plugins are `.ts` files in `.opencode/plugins/`. The installer copies them to the user's project. Plugins export a function that returns hook objects.

## Validation Scripts

Node.js scripts to validate project structure before deployment.

| Script | What it checks |
|--------|---------------|
| `validate-design` | DESIGN.md structure, required sections, format |
| `validate-skills` | SKILL.md frontmatter, required fields, naming convention |
| `validate-agents` | Agent .md files, frontmatter, mode field |
| `validate-config` | opencode.json against schema |
| `validate-plugins` | Plugin files, correct exports |
| `validate-all` | Run all validators |

Location: `scripts/` directory

Run via npm scripts:
```bash
npm run validate          # Run all validators
npm run validate:skills   # Validate skills only
npm run validate:agents   # Validate agents only
npm run validate:config   # Validate config only
```

Each script:
- Returns exit code 0 on success, 1 on failure
- Outputs specific error messages with file paths and line numbers
- Can be run standalone or as part of CI/pre-commit hook

## Skills

All skills prefixed with `osf-` to avoid conflicts with existing skills.

### Workflow Skills (Core)

| Skill | Purpose | Trigger |
|-------|---------|---------|
| `osf-debug` | Systematic debugging workflow | Bug, test failure, unexpected behavior |
| `osf-review` | Code quality and style review | Review request |
| `osf-tdd` | Test-driven development flow | Feature/bugfix implementation |
| `osf-spark` | Explore ideas before building | Creative work, new features |
| `osf-blueprint` | Create implementation plans | After brainstorming, before coding |
| `osf-forge` | Create/edit skills | Skill development |
| `osf-ask-review` | Verify work before merging | Before PR/merge |
| `osf-handle-review` | Process review feedback | After getting review comments |
| `osf-preflight` | Run checks before claiming done | Before saying "done" |
| `osf-swarm` | Dispatch parallel subagents | Independent tasks |
| `osf-isolate` | Git worktree isolation | Starting new feature |

### Role Skills (Domain Expertise)

Unopinionated best practices for each role. No framework bias — works with any stack.

| Skill | Purpose | Trigger |
|-------|---------|---------|
| `osf-ui-designer` | Visual design, component architecture, design systems, accessibility | UI work, component creation, design system tasks |
| `osf-ux-expert` | User experience, usability, information architecture, user flows | UX decisions, user research, flow design |
| `osf-tester` | Testing strategy, test architecture, coverage, test patterns | Test planning, test quality, coverage gaps |
| `osf-backend` | API design, server architecture, data modeling, performance | Backend work, API endpoints, data layer |
| `osf-frontend` | Client architecture, state management, rendering, performance | Frontend work, components, client-side logic |
| `osf-devops` | CI/CD, deployment, infrastructure, monitoring, scaling | DevOps tasks, deployment, infra work |
| `osf-data` | Data modeling, queries, migrations, data pipeline | Database work, data architecture, migrations |
| `osf-design-system` | Design systems, DESIGN.md, tokens, component specs | Design system creation, DESIGN.md authoring, token definition |
| `osf-engram` | Engram memory protocol — when to save, search, session lifecycle | Memory operations, session start/end, knowledge persistence |

Each skill contains:
- Best practices (unopinionated, framework-agnostic)
- Common patterns and anti-patterns
- Checklist for the role
- Questions to ask before starting

Each skill lives in `.opencode/skills/osf-<name>/SKILL.md`.

## Credits & Acknowledgments

oh-see-flow is inspired by and builds on the work of these open source projects:

| Project | What it provides | Link |
|---------|-----------------|------|
| **opencode** | The AI coding agent platform this workflow extends | [opencode.ai](https://opencode.ai) |
| **obra/superpowers** | Skills-based development methodology, TDD workflow, subagent-driven development | [github.com/obra/superpowers](https://github.com/obra/superpowers) |
| **Gentleman-Programming/gentle-ai** | SDD/OpenSpec flow, skill discovery, orchestrator contract, memory delegation | [github.com/Gentleman-Programming/gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) |
| **Engram** | Persistent memory across sessions | [github.com/Gentleman-Programming/engram](https://github.com/Gentleman-Programming/engram) |
| **Playwright** | Browser automation MCP | [playwright.dev](https://playwright.dev) |
| **Sentry** | Error monitoring MCP | [sentry.io](https://sentry.io) |
| **n8n** | Workflow automation MCP | [n8n.io](https://n8n.io) |
| **Railway** | Infrastructure MCP | [railway.app](https://railway.app) |
| **Context7** | Documentation lookup MCP | [context7.dev](https://context7.dev) |
| **Stitch** | Design systems MCP | [stitch.withgoogle.com](https://stitch.withgoogle.com) |
| **Cloudflare** | Workers/CDN MCP | [cloudflare.com](https://cloudflare.com) |

Credits will be included in:
- `README.md` — visible on GitHub
- `opencode.json` — comments (jsonc) or metadata
- Each skill file — attribution header

## Status

- [x] Orchestrator strategy — Plan-then-decompose + routing + fast path
- [x] Subagent reporting — Full (result + suggestion + Engram write)
- [x] Verifier — Full verification (all checks)
- [x] Model strategy — Default model + capability-based subagents (vision, context-builder, code-runner)
- [x] Capability routing — Auto-dispatch subagents for image/large context/code execution
- [x] Failure handling — Retry once, then escalate
- [x] Context sharing — Orchestrator context + Engram
- [x] Methodology — Hybrid (TDD + OpenSpecs, Engram-backed)
- [x] MCPs — Selection-based installer (9 MCPs available)
- [x] Commands — 9 commands with `osf:` prefix
- [x] Plugins — 7 plugins included (including capability-router)
- [x] Skills — 20 skills with `osf-` prefix (11 workflow + 9 role)
- [x] Install script — Interactive shell script
- [x] Credits — Attribution for all open source dependencies
- [x] Rules — Global, orchestrator, subagent, verifier, safety rules + YAGNI/DRY
- [x] Execution control — User chooses execution mode before running
- [x] Delegation triggers — Specific rules for when to delegate
- [x] Two-stage review — Spec compliance + code quality
- [x] Finishing a branch — Merge/PR/keep/discard workflow
- [x] Skill discovery registry — Scan multiple locations for skills
- [x] Orchestrator contract — Parent-session responsibilities
- [x] Memory delegation contract — How memory flows between agents
- [x] Validation scripts — Node.js validators for design, skills, agents, config
