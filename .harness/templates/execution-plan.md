# Execution Plan: <task-name>

## 1. Files to Modify

- `path/to/file`: <change summary>

## 1.1 Files to Read Only

- `path/to/file`: <reason>

## 1.2 Shared File Coordination

- `path/to/shared-file`: <coordination note>

## 2. Implementation Steps

1. 
2. 
3. 

## 3. Tests to Add or Update

- `tests/...`: <test purpose>

## 4. Verification Steps

```bash
make lint
make typecheck
make test
make verify
```

## 5. Assumptions

- [ASSUMPTION] 

## 5.1 Rollback Scope

- 

## 6. Approval Required

Approval is required before implementation if this task includes:

- [ ] Database schema change
- [ ] Authentication / authorization
- [ ] Payment / billing
- [ ] External API contract
- [ ] CI/CD or deployment
- [ ] Production dependency
- [ ] Large refactor
