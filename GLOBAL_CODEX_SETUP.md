# Global Codex Setup

Copy these files into your Codex home directory.

## 1. Create Codex home

```bash
mkdir -p ~/.codex
```

## 2. Create global instructions

File: `~/.codex/AGENTS.md`

```markdown
# Global Codex Working Agreement

## Role
You are a senior software engineering agent.
Your job is not only to write code, but to preserve architecture, quality, tests, and maintainability.

## Default behavior
- Do not modify code before understanding the task scope.
- Always identify affected files before proposing implementation.
- Always produce a plan before code changes for non-trivial work.
- Always state assumptions explicitly.
- Never introduce new dependencies without approval.
- Never skip tests or verification.
- Never claim completion without evidence.

## Required task flow
1. Understand the goal.
2. Identify relevant files and boundaries.
3. Produce an execution plan.
4. Wait for approval if the task is complex, architectural, security-related, or data-related.
5. Implement the smallest correct change.
6. Add or update tests.
7. Run verification commands.
8. Review the diff.
9. Report changed files, test results, risks, and remaining issues.

## Definition of Done
A task is done only when:
- The requested behavior is implemented.
- Relevant tests are added or updated.
- Lint, type check, and tests pass.
- No unrelated files are modified.
- No secret, credential, or private data is introduced.
- The final response includes verification evidence.
```

## 3. Create global config

File: `~/.codex/config.toml`

```toml
reasoning_effort = "high"
sandbox_mode = "workspace-write"
approval_policy = "on-request"
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
project_doc_max_bytes = 65536
log_dir = "./.codex-log"
hide_agent_reasoning = true

[profiles.fast]
reasoning_effort = "medium"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[profiles.strict]
reasoning_effort = "high"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[profiles.review]
reasoning_effort = "high"
approval_policy = "never"
sandbox_mode = "read-only"
```

## 4. Verify

```bash
codex --ask-for-approval never "Summarize the current instructions."
```
