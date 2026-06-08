const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', '.opencode', 'plugins');

let errors = [];

function validatePlugin(pluginFile) {
  const content = fs.readFileSync(pluginFile, 'utf-8');

  // Check for default export
  if (!content.includes('export default')) {
    errors.push(`Missing default export in ${pluginFile}`);
  }

  // Check for Plugin type
  if (!content.includes('satisfies Plugin')) {
    errors.push(`Missing 'satisfies Plugin' type assertion in ${pluginFile}`);
  }

  // Check for hook registration
  const hookPatterns = [
    'config:',
    'chat.message',
    'chat.params',
    'chat.headers',
    'tool.execute.before',
    'tool.execute.after',
    'tool.definition',
    'command.execute.before',
    'shell.env',
    'permission.ask',
    'event',
  ];

  const hasHook = hookPatterns.some(pattern => content.includes(pattern));
  if (!hasHook) {
    errors.push(`No hooks registered in ${pluginFile}`);
  }
}

// Main
if (fs.existsSync(PLUGINS_DIR)) {
  const plugins = fs.readdirSync(PLUGINS_DIR).filter(f => f.endsWith('.ts'));

  plugins.forEach(plugin => validatePlugin(path.join(PLUGINS_DIR, plugin)));
}

if (errors.length > 0) {
  console.error('Plugin validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('All plugins validated successfully');
}
