# Codex + Harness Starter Repository

This repository template is designed for quality-first AI-assisted development with Codex.

Core workflow:

```text
Task Spec -> Impact Map -> Execution Plan -> Approval -> Implementation -> Tests -> Verification -> Review -> PR
```

## Quick start

```bash
git init
make setup
make harness-impact TASK_ID=initial-check
codex --ask-for-approval never "Summarize the current instructions."
```

## Required first task

Before writing production code, create the initial architecture documents:

```text
docs/architecture/overview.md
docs/architecture/data-model.md
docs/architecture/api-contract.md
```

Prompt:

```text
Do not write production code yet.
Read AGENTS.md and the harness templates.
Create the initial architecture documents:
- docs/architecture/overview.md
- docs/architecture/data-model.md
- docs/architecture/api-contract.md
After writing docs, do not implement code. Report open questions and risks.
```
