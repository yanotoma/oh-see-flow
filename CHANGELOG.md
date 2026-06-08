# Changelog

All notable changes to oh-see-flow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-06-08

### Added

#### Agents
- `orchestrator` — Primary agent that plans, decomposes, and delegates tasks
- `coder` — Implements code changes following TDD practices
- `tester` — Writes and runs tests
- `researcher` — Explores codebase, docs, and web
- `reviewer` — Reviews code quality and style
- `debugger` — Systematic debugging workflow
- `verifier` — Validates subagent output (quality gate)
- `vision` — Processes images, screenshots, diagrams
- `context-builder` — Handles large documents/files exceeding context limits
- `code-runner` — Executes code and runs scripts

#### Skills (22 total)

**Workflow Skills (12):**
- `osf-debug` — Systematic debugging workflow
- `osf-review` — Code review workflow
- `osf-tdd` — Test-driven development (RED-GREEN-REFACTOR)
- `osf-spark` — Brainstorming and exploration before creative work
- `osf-blueprint` — Implementation planning
- `osf-forge` — Skill creation guide
- `osf-ask-review` — Request review before merging
- `osf-handle-review` — Process review feedback
- `osf-preflight` — Pre-completion verification checks
- `osf-swarm` — Parallel subagent dispatch
- `osf-isolate` — Git worktree isolation
- `osf-create-skill` — Create new skills for oh-see-flow

**Role Skills (9):**
- `osf-ui-designer` — UI and component design best practices
- `osf-ux-expert` — User experience best practices
- `osf-tester` — Testing strategy best practices
- `osf-backend` — API/backend patterns
- `osf-frontend` — Frontend patterns
- `osf-devops` — CI/CD and infrastructure
- `osf-data` — Data modeling and queries
- `osf-design-system` — Design systems and DESIGN.md
- `osf-engram` — Engram memory protocol
- `osf-seo` — Search engine optimization

#### Plugins (7)
- `engram-context` — Auto-inject Engram memories into subagent prompts
- `task-logger` — Log orchestrator decisions and subagent results
- `result-collector` — Gather and format subagent results
- `env-guard` — Block secrets from leaking into logs/outputs
- `model-stats` — Track token usage per agent
- `perf-monitor` — Track tokens/second, latency, throughput
- `capability-router` — Auto-dispatch capability subagents for images/large context/code

#### Commands (11)
- `osf:grill` — Ask clarifying questions before planning
- `osf:plan` — Orchestrator creates implementation plan
- `osf:execute` — Execute plan via subagents (with execution mode selection)
- `osf:review` — Review current changes
- `osf:test` — Run tests and report
- `osf:debug` — Start systematic debugging
- `osf:deploy` — Deploy (requires explicit user confirmation)
- `osf:spec` — Generate spec from requirements
- `osf:ship` — Full flow: test → review → merge → deploy
- `osf:finish` — Finish branch (merge/PR/keep/discard)
- `osf:refresh-registry` — Refresh skill discovery registry

#### Validation Scripts (4)
- `validate-skills` — Validate SKILL.md files
- `validate-agents` — Validate agent .md files
- `validate-config` — Validate opencode.json
- `validate-plugins` — Validate plugin files

#### MCPs (9 available)
- Playwright, GitHub, Sentry, n8n, Railway, Context7, Engram, Stitch, Cloudflare

#### Features
- Interactive installer with MCP and capability model selection
- Capability-based subagents (vision, context-builder, code-runner)
- Engram memory sharing between agents
- Two-stage review (spec compliance + code quality)
- Execution modes (auto, review-plan, step-by-step, dry-run, direct)
- Failure handling (retry once, then escalate)
- Skill discovery registry
- Delegation triggers for automatic routing
- YAGNI and DRY principles enforced

## [0.0.1] - 2026-06-08

### Added
- Initial project scaffold
- Basic agent structure
- README and design spec

[Unreleased]: https://github.com/yanotoma/oh-see-flow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yanotoma/oh-see-flow/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/yanotoma/oh-see-flow/releases/tag/v0.0.1
