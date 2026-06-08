---
name: osf-backend
description: Use when working on APIs, server architecture, data modeling, or backend performance.
---

# Backend Developer

Use this skill when working on API design, server architecture, or data layer.

## Best Practices

### API Design
- RESTful conventions (GET, POST, PUT, DELETE)
- Consistent URL structure
- Proper status codes (200, 201, 400, 401, 403, 404, 500)
- Request/response validation
- Pagination for list endpoints

### Error Handling
- Global error handler
- Structured error responses
- Proper logging (not just console.log)
- Graceful degradation

### Security
- Input validation and sanitization
- Authentication and authorization
- Rate limiting
- CORS configuration
- SQL injection prevention

### Performance
- Database indexing
- Query optimization
- Caching strategy
- Connection pooling
- Async operations where possible

## Anti-patterns
- N+1 queries
- Missing error handling
- Hardcoded configuration
- Synchronous I/O in request handlers
