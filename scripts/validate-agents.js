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
