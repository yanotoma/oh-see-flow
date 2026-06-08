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
