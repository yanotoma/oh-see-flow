#!/bin/bash

# oh-see-flow TUI installer
# Usage: ./install.sh
#        curl -fsSL .../install.sh | bash -s -- [--project|--global]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Box drawing
BOX_TOP="╔══════════════════════════════════════════════════════════════╗"
BOX_BOT="╚══════════════════════════════════════════════════════════════╝"
BOX_MID="╠══════════════════════════════════════════════════════════════╣"
BOX_SEP="║──────────────────────────────────────────────────────────────║"

REPO_URL="https://raw.githubusercontent.com/yanotoma/oh-see-flow/main"
TEMP_DIR=$(mktemp -d)

# Cleanup on exit
trap "rm -rf $TEMP_DIR" EXIT

# Selected options
INSTALL_MODE=""
SELECTED_MCPS=()
VISION_MODEL="anthropic/claude-sonnet-4-6"
CONTEXT_MODEL="anthropic/claude-sonnet-4-6"
CODE_MODEL="openai/gpt-4o"

# Helper functions
print_box() {
  local text="$1"
  local padding=$((60 - ${#text}))
  printf "║ ${WHITE}%s${NC}%*s║\n" "$text" "$padding" ""
}

print_centered() {
  local text="$1"
  local padding=$(( (60 - ${#text}) / 2 ))
  printf "%*s${WHITE}%s${NC}\n" "$padding" "" "$text"
}

print_header() {
  echo ""
  echo -e "${CYAN}${BOX_TOP}${NC}"
  echo -e "${CYAN}║${NC}"
  print_centered "oh-see-flow"
  echo -e "${CYAN}║${NC}"
  print_centered "pronounced: oh-see-flow"
  echo -e "${CYAN}║${NC}"
  print_centered "Custom workflow for opencode"
  echo -e "${CYAN}║${NC}"
  echo -e "${CYAN}${BOX_BOT}${NC}"
  echo ""
}

print_section() {
  local title="$1"
  echo ""
  echo -e "${CYAN}${BOX_TOP}${NC}"
  print_box "$title"
  echo -e "${CYAN}${BOX_BOT}${NC}"
  echo ""
}

# Interactive menu with arrow keys
# Returns selected index
interactive_menu() {
  local title="$1"
  shift
  local options=("$@")
  local selected=0
  local multi="${MULTI_SELECT:-false}"
  local selections=()

  if [ "$multi" = "true" ]; then
    for i in "${!options[@]}"; do
      selections+=(0)
    done
  fi

  # Hide cursor
  tput civis

  # Cleanup on exit
  trap "tput cnorm; rm -rf $TEMP_DIR" EXIT

  while true; do
    # Clear and print
    tput cuu1 2>/dev/null || true
    printf "\033[K"
    
    echo -e "${CYAN}  $title${NC}"
    echo -e "${GRAY}  Use ↑↓ arrows, Enter to select, 'a' for all, 'n' for none${NC}"
    echo ""

    for i in "${!options[@]}"; do
      printf "\033[K"
      if [ "$multi" = "true" ]; then
        if [ "${selections[$i]}" = "1" ]; then
          checkbox="${GREEN}[✓]${NC}"
        else
          checkbox="${GRAY}[ ]${NC}"
        fi
        if [ $i -eq $selected ]; then
          echo -e "  ${WHITE}▶ ${checkbox} ${options[$i]}${NC}"
        else
          echo -e "    ${checkbox} ${options[$i]}"
        fi
      else
        if [ $i -eq $selected ]; then
          echo -e "  ${WHITE}▶ ${GREEN}●${NC} ${WHITE}${options[$i]}${NC}"
        else
          echo -e "    ${GRAY}○${NC} ${options[$i]}"
        fi
      fi
    done

    # Read key
    read -rsn1 key

    case "$key" in
      $'\x1b')
        read -rsn2 key
        case "$key" in
          '[A') # Up
            ((selected--))
            if [ $selected -lt 0 ]; then
              selected=$((${#options[@]} - 1))
            fi
            ;;
          '[B') # Down
            ((selected++))
            if [ $selected -ge ${#options[@]} ]; then
              selected=0
            fi
            ;;
        esac
        ;;
      '') # Enter
        if [ "$multi" = "true" ]; then
          # Return selections as space-separated indices
          local result=""
          for i in "${!selections[@]}"; do
            if [ "${selections[$i]}" = "1" ]; then
              result="$result $i"
            fi
          done
          echo "$result"
          tput cnorm
          return
        else
          echo "$selected"
          tput cnorm
          return
        fi
        ;;
      'a') # Select all (multi-select only)
        if [ "$multi" = "true" ]; then
          for i in "${!selections[@]}"; do
            selections[$i]=1
          done
        fi
        ;;
      'n') # Select none (multi-select only)
        if [ "$multi" = "true" ]; then
          for i in "${!selections[@]}"; do
            selections[$i]=0
          done
        fi
        ;;
      ' ') # Toggle (multi-select only)
        if [ "$multi" = "true" ]; then
          if [ "${selections[$selected]}" = "1" ]; then
            selections[$selected]=0
          else
            selections[$selected]=1
          fi
        fi
        ;;
    esac

    # Move cursor up to redraw
    tput cuu $((${#options[@]} + 2)) 2>/dev/null || true
  done
}

# Yes/No prompt
confirm_prompt() {
  local question="$1"
  local default="${2:-y}"
  
  while true; do
    echo -ne "${WHITE}  $question${NC} ${GRAY}[y/n]${NC}: "
    read -rsn1 answer
    answer=${answer:-$default}
    echo ""
    
    case "$answer" in
      y|Y) return 0 ;;
      n|N) return 1 ;;
      *) echo -e "${RED}  Please enter y or n${NC}" ;;
    esac
  done
}

# Text input with default
text_input() {
  local prompt="$1"
  local default="$2"
  
  echo -ne "${WHITE}  $prompt${NC} ${GRAY}[$default]${NC}: "
  read answer
  echo "${answer:-$default}"
}

# Main installation
main() {
  clear 2>/dev/null || true
  print_header

  # Parse arguments
  for arg in "$@"; do
    case $arg in
      --project) INSTALL_MODE="project" ;;
      --global) INSTALL_MODE="global" ;;
    esac
  done

  # Check if interactive
  if [ ! -t 0 ]; then
    if [ -z "$INSTALL_MODE" ]; then
      INSTALL_MODE="project"
    fi
    echo -e "${YELLOW}  ⚠ Non-interactive mode. Using defaults.${NC}"
    echo -e "${GRAY}  Run ./install.sh directly for full TUI experience.${NC}"
  fi

  # Step 1: Install location
  print_section "Step 1: Install Location"
  
  if [ -z "$INSTALL_MODE" ]; then
    choice=$(interactive_menu "Where do you want to install?" \
      "Project-local (.opencode/ in current directory)" \
      "Global (~/.config/opencode/)")
    
    if [ "$choice" = "1" ]; then
      INSTALL_MODE="global"
    else
      INSTALL_MODE="project"
    fi
  fi

  if [ "$INSTALL_MODE" = "global" ]; then
    INSTALL_DIR="$HOME/.config/opencode"
    echo -e "  ${GREEN}✓${NC} Installing to: ${WHITE}~/.config/opencode/${NC}"
  else
    INSTALL_DIR=".opencode"
    echo -e "  ${GREEN}✓${NC} Installing to: ${WHITE}.opencode/${NC}"
  fi

  # Step 2: Capability models
  print_section "Step 2: Capability Models"
  echo -e "${GRAY}  Configure which models handle specific capabilities.${NC}"
  echo -e "${GRAY}  Press Enter for defaults.${NC}"
  echo ""

  if [ -t 0 ]; then
    VISION_MODEL=$(text_input "Vision/images model" "$VISION_MODEL")
    CONTEXT_MODEL=$(text_input "Large context model" "$CONTEXT_MODEL")
    CODE_MODEL=$(text_input "Code execution model" "$CODE_MODEL")
  fi

  echo ""
  echo -e "  ${GREEN}✓${NC} Vision: ${WHITE}$VISION_MODEL${NC}"
  echo -e "  ${GREEN}✓${NC} Context: ${WHITE}$CONTEXT_MODEL${NC}"
  echo -e "  ${GREEN}✓${NC} Code: ${WHITE}$CODE_MODEL${NC}"

  # Step 3: MCP selection
  print_section "Step 3: MCP Servers"
  echo -e "${GRAY}  Select MCPs to configure. Space to toggle, Enter to confirm.${NC}"
  echo ""

  MCP_NAMES=(
    "Playwright - Browser automation"
    "GitHub - Issues, PRs, repos"
    "Sentry - Error monitoring"
    "n8n - Workflow automation"
    "Railway - Infrastructure"
    "Context7 - Documentation lookup"
    "Engram - Persistent memory (recommended)"
    "Stitch - Design systems"
    "Cloudflare - Workers, DNS, CDN"
  )

  if [ -t 0 ]; then
    MULTI_SELECT=true
    mcp_result=$(interactive_menu "Select MCPs:" "${MCP_NAMES[@]}")
    MULTI_SELECT=false
    
    # Parse results
    for idx in $mcp_result; do
      SELECTED_MCPS+=($idx)
    done
  else
    # Default: just Engram
    SELECTED_MCPS=(6)
  fi

  echo ""
  if [ ${#SELECTED_MCPS[@]} -eq 0 ]; then
    echo -e "  ${YELLOW}⚠${NC} No MCPs selected"
  else
    for idx in "${SELECTED_MCPS[@]}"; do
      echo -e "  ${GREEN}✓${NC} ${MCP_NAMES[$idx]}"
    done
  fi

  # Step 4: Prerequisites check
  print_section "Step 4: Prerequisites"
  
  MISSING=""

  # Check Node.js
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✓${NC} Node.js ${GRAY}($NODE_VERSION)${NC}"
  else
    echo -e "  ${RED}✗${NC} Node.js ${GRAY}(required for npm MCPs)${NC}"
    MISSING="$MISSING node"
  fi

  # Check npm
  if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "  ${GREEN}✓${NC} npm ${GRAY}(v$NPM_VERSION)${NC}"
  else
    echo -e "  ${RED}✗${NC} npm"
    MISSING="$MISSING npm"
  fi

  # Check Engram if selected
  if [[ " ${SELECTED_MCPS[*]} " =~ " 6 " ]]; then
    if command -v engram &> /dev/null; then
      echo -e "  ${GREEN}✓${NC} Engram"
    else
      echo -e "  ${RED}✗${NC} Engram ${GRAY}(install: brew install gentleman-programming/tap/engram)${NC}"
      MISSING="$MISSING engram"
    fi
  fi

  # Check git
  if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    echo -e "  ${GREEN}✓${NC} git ${GRAY}($GIT_VERSION)${NC}"
  else
    echo -e "  ${RED}✗${NC} git"
    MISSING="$MISSING git"
  fi

  echo ""
  if [ -n "$MISSING" ]; then
    echo -e "  ${YELLOW}⚠ Missing:$MISSING${NC}"
    if [ -t 0 ]; then
      if ! confirm_prompt "Continue anyway?"; then
        echo -e "${RED}  Aborted.${NC}"
        exit 1
      fi
    fi
  else
    echo -e "  ${GREEN}✓ All prerequisites satisfied${NC}"
  fi

  # Step 5: Install
  print_section "Step 5: Installing"
  
  # Create directories
  echo -e "  ${GRAY}Creating directories...${NC}"
  mkdir -p "$INSTALL_DIR/agents"
  mkdir -p "$INSTALL_DIR/skills"
  mkdir -p "$INSTALL_DIR/plugins"
  mkdir -p ".osf"
  mkdir -p "scripts"
  echo -e "  ${GREEN}✓${NC} Directories created"

  # Download agents
  echo -e "  ${GRAY}Downloading agents...${NC}"
  for agent in orchestrator coder tester researcher reviewer debugger verifier vision context-builder code-runner; do
    curl -sL "$REPO_URL/.opencode/agents/$agent.md" -o "$INSTALL_DIR/agents/$agent.md"
  done
  echo -e "  ${GREEN}✓${NC} 10 agents installed"

  # Download skills
  echo -e "  ${GRAY}Downloading skills...${NC}"
  for skill in osf-debug osf-review osf-tdd osf-spark osf-blueprint osf-forge osf-ask-review osf-handle-review osf-preflight osf-swarm osf-isolate osf-ui-designer osf-ux-expert osf-tester osf-backend osf-frontend osf-devops osf-data osf-design-system osf-engram osf-seo osf-create-skill; do
    mkdir -p "$INSTALL_DIR/skills/$skill"
    curl -sL "$REPO_URL/.opencode/skills/$skill/SKILL.md" -o "$INSTALL_DIR/skills/$skill/SKILL.md"
  done
  echo -e "  ${GREEN}✓${NC} 22 skills installed"

  # Download plugins (disabled by default)
  echo -e "  ${GRAY}Downloading plugins...${NC}"
  for plugin in engram-context.ts task-logger.ts result-collector.ts env-guard.ts model-stats.ts perf-monitor.ts capability-router.ts; do
    curl -sL "$REPO_URL/.opencode/plugins/$plugin" -o "$INSTALL_DIR/plugins/$plugin"
  done
  echo -e "  ${GREEN}✓${NC} 7 plugins downloaded (disabled by default)"

  # Download AGENTS.md
  echo -e "  ${GRAY}Downloading AGENTS.md...${NC}"
  curl -sL "$REPO_URL/AGENTS.md" -o "AGENTS.md"
  echo -e "  ${GREEN}✓${NC} AGENTS.md installed"

  # Download validation scripts
  echo -e "  ${GRAY}Downloading validation scripts...${NC}"
  for script in validate-skills.js validate-agents.js validate-config.js validate-plugins.js; do
    curl -sL "$REPO_URL/scripts/$script" -o "scripts/$script"
  done
  echo -e "  ${GREEN}✓${NC} 4 validation scripts installed"

  # Save capability models
  cat > .osf/capability-models.json << EOF
{
  "vision": "$VISION_MODEL",
  "large_context": "$CONTEXT_MODEL",
  "code_execution": "$CODE_MODEL"
}
EOF
  echo -e "  ${GREEN}✓${NC} Capability models configured"

  # Build MCP config
  MCP_CONFIG="{}"
  if [ ${#SELECTED_MCPS[@]} -gt 0 ]; then
    MCP_CONFIG="{"
    for idx in "${SELECTED_MCPS[@]}"; do
      case $idx in
        0) MCP_CONFIG="$MCP_CONFIG\"playwright\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@playwright/mcp\"],\"enabled\":true}," ;;
        1) MCP_CONFIG="$MCP_CONFIG\"github\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@modelcontextprotocol/server-github\"],\"enabled\":true}," ;;
        2) MCP_CONFIG="$MCP_CONFIG\"sentry\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@sentry/mcp\"],\"enabled\":true}," ;;
        3) MCP_CONFIG="$MCP_CONFIG\"n8n\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@n8n/mcp\"],\"enabled\":true}," ;;
        4) MCP_CONFIG="$MCP_CONFIG\"railway\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@railway/mcp\"],\"enabled\":true}," ;;
        5) MCP_CONFIG="$MCP_CONFIG\"context7\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@context7/mcp\"],\"enabled\":true}," ;;
        6) MCP_CONFIG="$MCP_CONFIG\"engram\":{\"type\":\"local\",\"command\":[\"engram\",\"mcp\"],\"enabled\":true}," ;;
        7) MCP_CONFIG="$MCP_CONFIG\"stitch\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@stitch/mcp\"],\"enabled\":true}," ;;
        8) MCP_CONFIG="$MCP_CONFIG\"cloudflare\":{\"type\":\"local\",\"command\":[\"npx\",\"-y\",\"@cloudflare/mcp\"],\"enabled\":true}," ;;
      esac
    done
    MCP_CONFIG="${MCP_CONFIG%,}}"
  fi

  # Generate opencode.json
  echo -e "  ${GRAY}Generating opencode.json...${NC}"
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
  "plugin": [],
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
  echo -e "  ${GREEN}✓${NC} opencode.json generated"

  # Create package.json if needed
  if [ ! -f package.json ]; then
    cat > package.json << EOF
{
  "name": "oh-see-flow",
  "version": "0.1.0",
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
    echo -e "  ${GREEN}✓${NC} package.json created"
  fi

  # Done
  echo ""
  echo -e "${GREEN}${BOX_TOP}${NC}"
  echo -e "${GREEN}║${NC}"
  print_centered "Installation Complete!"
  echo -e "${GREEN}║${NC}"
  echo -e "${GREEN}${BOX_BOT}${NC}"
  echo ""
  echo -e "  ${BOLD}Installed:${NC}"
  echo -e "    • 10 agents (orchestrator + 9 subagents)"
  echo -e "    • 22 skills (12 workflow + 10 role)"
  echo -e "    • 7 plugins (disabled by default)"
  echo -e "    • 4 validation scripts"
  echo ""
  echo -e "  ${BOLD}Next steps:${NC}"
  echo -e "    1. ${WHITE}Restart opencode${NC} to load the new config"
  echo -e "    2. Run ${WHITE}npm run validate${NC} to verify installation"
  echo -e "    3. Try ${WHITE}osf:grill${NC} to start brainstorming"
  echo ""
  echo -e "  ${BOLD}Documentation:${NC} ${CYAN}https://github.com/yanotoma/oh-see-flow${NC}"
  echo ""
}

main "$@"
