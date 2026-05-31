# Security Rules

## Secrets

- Never commit secrets.
- Never print secrets in logs.
- Use environment variables or secret managers.
- Add `.env.example` with placeholder values only.

## Input validation

- Validate all external input.
- Reject invalid input early.
- Avoid implicit type coercion for security-sensitive fields.

## Authorization

- Authentication answers: who are you?
- Authorization answers: are you allowed to do this?
- Never assume authorization from frontend state.
- Server-side authorization is mandatory.

## Database

- Use parameterized queries.
- Avoid raw SQL string interpolation.
- Check migration impact before schema changes.

## Logging

Do not log:

- Passwords
- Access tokens
- Refresh tokens
- API keys
- National ID numbers
- Card numbers
- Sensitive personal data
