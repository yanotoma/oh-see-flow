---
name: osf-devops
description: Use when working on CI/CD, deployment, infrastructure, or monitoring. Provides DevOps best practices.
---

# DevOps

Use this skill when working on deployment, infrastructure, or CI/CD.

## Best Practices

### CI/CD
- Automated testing in pipeline
- Linting and type checking
- Build verification
- Automated deployment to staging
- Manual approval for production

### Infrastructure as Code
- Version controlled infrastructure
- Reproducible environments
- Secret management (not in code)
- Environment parity (dev ≈ staging ≈ prod)

### Monitoring
- Health checks
- Error tracking
- Performance metrics
- Log aggregation
- Alerting for critical issues

### Deployment
- Blue/green or canary deployments
- Rollback capability
- Database migrations
- Feature flags for gradual rollout

## Anti-patterns
- Manual deployments
- Secrets in code
- No rollback plan
- "Works on my machine"
