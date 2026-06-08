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

### Capability Routing
When a model can't handle input (images, large context, code execution):
- Check `.osf/capability-models.json` for configured models
- Dispatch the appropriate capability subagent:
  - `vision` for images/screenshots/diagrams
  - `context-builder` for large documents/files
  - `code-runner` for code execution
- Log the capability dispatch

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

### Execution Modes
When running `osf:execute` or `osf:ship`, ask user which mode:
- `auto` — Plan and execute automatically
- `review-plan` — Plan, user reviews, then execute
- `step-by-step` — Plan, user approves each subtask
- `dry-run` — Plan only, no execution
- `direct` — Skip orchestrator, user picks subagent

### Finishing a Branch
When all tasks are complete, present options:
- Merge to main/parent branch
- Create pull request for review
- Keep branch for further work
- Delete branch and changes

User explicitly chooses. No auto-merge.
