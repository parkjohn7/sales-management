# Plan Before Code Skill

## When to use

Use this skill for any non-trivial code change, feature, bug fix, refactor, API change, or architecture-related task.

## Inputs

- Task description
- Task spec path
- Impact map path
- Relevant harness rules

## Procedure

1. Read AGENTS.md.
2. Read the task spec.
3. Read the impact map.
4. Identify files to modify.
5. Identify files to read only.
6. Identify out-of-scope files.
7. Produce an execution plan.
8. List assumptions explicitly.
9. Stop before modifying files.

## Output format

```markdown
# Execution Plan

## Files to modify

## Changes per file

## Tests to add or update

## Verification commands

## Assumptions

## Approval required
```

## Stop condition

Stop after producing the plan. Do not modify files until the user says `[APPROVED]`.
