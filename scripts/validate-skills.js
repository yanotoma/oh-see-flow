const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', '.opencode', 'skills');
const REQUIRED_FRONTMATTER = ['name', 'description'];
const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const MAX_NAME_LENGTH = 64;

let errors = [];

function validateSkill(skillPath) {
  const skillFile = path.join(skillPath, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    errors.push(`Missing SKILL.md in ${skillPath}`);
    return;
  }

  const content = fs.readFileSync(skillFile, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    errors.push(`Missing frontmatter in ${skillFile}`);
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
      errors.push(`Missing required field '${field}' in ${skillFile}`);
    }
  });

  // Validate name
  if (fields.name) {
    const folderName = path.basename(skillPath);
    if (fields.name !== folderName) {
      errors.push(`Name '${fields.name}' doesn't match folder name '${folderName}' in ${skillFile}`);
    }
    if (!NAME_PATTERN.test(fields.name)) {
      errors.push(`Name '${fields.name}' must be lowercase, hyphen-separated in ${skillFile}`);
    }
    if (fields.name.length > MAX_NAME_LENGTH) {
      errors.push(`Name '${fields.name}' exceeds max length of ${MAX_NAME_LENGTH} in ${skillFile}`);
    }
  }

  // Validate description
  if (fields.description && fields.description.length < 10) {
    errors.push(`Description too short in ${skillFile}`);
  }

  // Check for osf- prefix
  if (fields.name && !fields.name.startsWith('osf-')) {
    errors.push(`Skill name '${fields.name}' must start with 'osf-' prefix in ${skillFile}`);
  }
}

// Main
if (fs.existsSync(SKILLS_DIR)) {
  const skills = fs.readdirSync(SKILLS_DIR).filter(f =>
    fs.statSync(path.join(SKILLS_DIR, f)).isDirectory()
  );

  skills.forEach(skill => { validateSkill(path.join(SKILLS_DIR, skill)); });
}

if (errors.length > 0) {
  console.error('Skill validation failed:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('All skills validated successfully');
}
