# Releasing

oh-see-flow uses [semantic-release](https://github.com/semantic-release/semantic-release) for automatic versioning and publishing.

## How It Works

When you push to `main`, GitHub Actions will:

1. Analyze commit messages
2. Determine the next version (patch/minor/major)
3. Update `CHANGELOG.md`
4. Create a GitHub Release with release notes
5. Publish to npm
6. Commit the version bump and changelog back to the repo

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) to control versioning:

```bash
# Patch release (0.1.0 -> 0.1.1)
fix: fix the login bug
fix(auth): handle expired tokens

# Minor release (0.1.0 -> 0.2.0)
feat: add dark mode support
feat(ui): add theme selector

# Major release (0.1.0 -> 1.0.0)
feat!: redesign API structure
BREAKING CHANGE: API endpoints changed

# No release (documentation, chores, etc.)
docs: update README
chore: update dependencies
ci: fix GitHub Actions workflow
```

## Workflow

```bash
# 1. Make changes
git add .
git commit -m "feat: add new feature"

# 2. Push to main
git push origin main

# 3. semantic-release handles everything automatically
```

## What Gets Released

When a release happens, semantic-release will:

- **Version**: Auto-bump based on commit type
- **CHANGELOG.md**: Auto-update with release notes
- **GitHub Release**: Auto-create with notes and tag
- **npm**: Auto-publish `@yanotoma/oh-see-flow`

## Setup (One-time)

### 1. npm access token

1. Go to https://www.npmjs.com/settings/tokens
2. Create an **Automation** token
3. Copy the token

### 2. GitHub Secrets

Add these secrets to your repo (Settings → Secrets and variables → Actions):

| Secret | Value |
|--------|-------|
| `NPM_TOKEN` | Your npm access token |

The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### 3. npm scope

Ensure the `@yanotoma` scope exists:
```bash
npm login
npm org create yanotoma  # If not already created
```

## Testing Locally

```bash
# Dry run (no actual release)
npx semantic-release --dry-run

# Check what version would be released
npx semantic-release --dry-run --no-ci
```

## Manual Release (Emergency)

If you need to force a release:

```bash
# Bump version manually
npm version patch  # or minor/major

# Push with tag
git push && git push --tags

# Publish manually
npm publish --access public
```
