# Releasing

oh-see-flow uses GitHub Actions to automatically publish to npm when the version changes on `main`.

## How to Release

### 1. Update the version

```bash
# Patch release (0.1.0 -> 0.1.1)
npm run release:patch

# Minor release (0.1.0 -> 0.2.0)
npm run release:minor

# Major release (0.1.0 -> 1.0.0)
npm run release:major
```

This will:
- Update `package.json` version
- Update `CHANGELOG.md`
- Create a git commit
- Create a git tag

### 2. Push to GitHub

```bash
git push && git push --tags
```

### 3. GitHub Actions does the rest

When you push to `main` with a new version, GitHub Actions will:
1. Run validation checks
2. Publish to npm
3. Create a GitHub Release with release notes

## Setup (One-time)

### 1. Create npm access token

1. Go to https://www.npmjs.com/settings/tokens
2. Create a new token (Automation type)
3. Copy the token

### 2. Add token to GitHub Secrets

1. Go to your repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Your npm token

### 3. Ensure npm scope exists

If using a scoped package (`@yanotoma/oh-see-flow`):
```bash
npm login
npm org create yanotoma  # If not already created
```

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **PATCH** (0.1.0 → 0.1.1): Bug fixes, minor changes
- **MINOR** (0.1.0 → 0.2.0): New features, backward compatible
- **MAJOR** (0.1.0 → 1.0.0): Breaking changes

## Manual Release (if needed)

```bash
# Validate
npm run validate

# Publish
npm publish --access public
```
