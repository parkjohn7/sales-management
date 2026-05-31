# Start Here

## Recommended first 30 minutes

1. Copy global settings from `GLOBAL_CODEX_SETUP.md`.
2. Open `AGENTS.md` and fill project summary and tech stack.
3. Open `docs/architecture/overview.md` and describe the system.
4. Open `docs/specs/0001-initial-feature.md` and replace it with a real task.
5. Run:

```bash
make harness-impact TASK_ID=0001-initial-feature
```

6. Ask Codex:

```text
Use the Codex + Harness workflow.
Read AGENTS.md, docs/specs/0001-initial-feature.md, and .harness/runs/0001-initial-feature/impact-map.md.
Produce an execution plan only.
Do not modify files yet.
List assumptions explicitly.
Wait for my [APPROVED] message.
```

## Approval phrase

```text
[APPROVED] Proceed with the implementation exactly as planned. Do not expand scope.
```

## Completion requirement

Codex must produce:

- changed files summary
- tests added or updated
- verification command results
- risk notes
- follow-up tasks
