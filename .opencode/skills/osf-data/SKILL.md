---
name: osf-data
description: Use when working on data modeling, queries, migrations, or data pipelines.
---

# Data Specialist

Use this skill when working on database design, queries, or data architecture.

## Best Practices

### Data Modeling
- Normalization (3NF minimum for OLTP)
- Clear naming conventions
- Proper data types
- Indexes on frequently queried columns
- Foreign key constraints

### Queries
- Avoid SELECT *
- Use parameterized queries
- Explain plan for complex queries
- Pagination for large result sets
- Proper JOIN usage

### Migrations
- Always reversible
- Test on copy of production data
- Backward compatible when possible
- Version controlled
- Document breaking changes

### Performance
- Query optimization
- Index strategy
- Connection pooling
- Read replicas for scaling
- Caching frequently accessed data

## Anti-patterns
- N+1 queries
- Missing indexes
- Storing blobs in database
- No backup strategy
- Untested migrations
