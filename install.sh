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
for agent in orchestrator coder tester researcher reviewer debugger verifier vision context-builder code-runner; do
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
    },
    "vision": {
      "description": "Processes images, screenshots, diagrams, and visual content.",
      "mode": "subagent"
    },
    "context-builder": {
      "description": "Handles large documents and files that exceed normal context limits.",
      "mode": "subagent"
    },
    "code-runner": {
      "description": "Executes code, runs scripts, and manages code execution tasks.",
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
    "$INSTALL_DIR/plugins/perf-monitor.ts",
    "$INSTALL_DIR/plugins/capability-router.ts"
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
echo "  - 10 agents (orchestrator + 9 subagents)"
echo "  - 20 skills (11 workflow + 9 role)"
echo "  - 7 plugins"
echo "  - 4 validation scripts"
echo ""
echo "Next steps:"
echo "  1. Restart opencode to load the new config"
echo "  2. Run 'npm run validate' to verify installation"
echo "  3. Try 'osf:grill' to start brainstorming"
echo ""
echo "Documentation: https://github.com/yanotoma/oh-see-flow"
