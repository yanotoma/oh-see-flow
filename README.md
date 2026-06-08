# oh-see-flow

Custom workflow configuration for [opencode](https://opencode.ai).

Pronounced: **oh-see-flow**

## What's Inside

```
├── opencode.json              # Main config (MCPs, plugins, agents, commands)
├── AGENTS.md                  # Global rules and instructions
├── .opencode/
│   ├── agents/
│   │   ├── reviewer.md        # Code review subagent
│   │   └── debugger.md        # Systematic debugging subagent
│   ├── skills/
│   │   ├── code-reviewer/     # Code review workflow
│   │   └── systematic-debugger/ # Debugging workflow
│   └── plugins/               # Custom plugins (extend as needed)
```

## Usage

### Option 1: Copy to your project

Copy the files you want into your project's root:

```bash
cp -r .opencode/ /path/to/your/project/
cp opencode.json /path/to/your/project/
cp AGENTS.md /path/to/your/project/
```

### Option 2: Use as global config

Copy to your global opencode config:

```bash
cp -r .opencode/ ~/.config/opencode/
cp opencode.json ~/.config/opencode/
cp AGENTS.md ~/.config/opencode/
```

### Option 3: Reference skills from another project

Add to your project's `opencode.json`:

```json
{
  "skills": {
    "paths": ["/path/to/oh-see-flow/.opencode/skills"]
  }
}
```

## Customization

### Adding Agents

Create a new `.md` file in `.opencode/agents/`:

```markdown
---
description: What this agent does.
mode: subagent
---

Your agent's system prompt here.
```

### Adding Skills

Create a new folder in `.opencode/skills/` with a `SKILL.md`:

```markdown
---
name: my-skill
description: When to use this skill and what it does.
---

# My Skill

Instructions here...
```

### Adding MCPs

Add to `opencode.json` under `mcp`:

```json
{
  "mcp": {
    "my-server": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-server"],
      "enabled": true
    }
  }
}
```

### Adding Plugins

Place `.ts` or `.js` files in `.opencode/plugins/`, or reference npm packages in `opencode.json`.

## Contributing

This is a personal workflow project. Fork it and make it your own!

## License

MIT
