# Project Subagents — Frontend

These are project-scoped Claude Code subagents for the Creative Production Management Platform **frontend**. They implement the roles defined in `AGENT_WORKFLOW.md` (repo root) as actual, invokable subagents, with frontend-specific rule sets.

## How they work

Claude Code automatically discovers any `*.md` file with frontmatter in `.claude/agents/`. The main assistant can delegate to them via the Agent tool, OR you can invoke one explicitly:

```
> Use the code-enforcer subagent to review src/modules/auth/components/LoginForm.tsx
> Use the architect subagent to run a drift check on src/modules/
> Use the project-manager subagent to summarise sprint health
> Use the feature-spec-author subagent to generate a spec for F-FE-006
> Use the a11y-enforcer subagent to audit src/modules/qc-panel/components/
> Use the bundle-size subagent to evaluate the latest build
> Use the api-contract-guard subagent to verify no @contracts types are redefined
```

## Roster

| Agent | When it runs | Tools |
|---|---|---|
| **code-enforcer** | After any code is written or edited (always active) | Read, Grep, Glob, Bash |
| **project-manager** | At session start (FULL mode) or "where are we?" questions | Read, Grep, Glob, Bash |
| **architect** | New module / route / contract / `drift check` | Read, Grep, Glob, Bash |
| **developer** | "What's next?" — finds the next unblocked task | Read, Grep, Glob, Bash |
| **qa-engineer** | Before marking a feature Complete; bug triage | Read, Grep, Glob, Bash |
| **tech-debt** | Session start (FULL); when reviewing quality direction | Read, Grep, Glob, Bash |
| **security** | New deps / new external API / new PII surface / `security audit` | Read, Grep, Glob, Bash |
| **documentation** | New exported hooks/components/types; session close | Read, Grep, Glob, Bash |
| **feature-spec-author** | Generating a new `specs/FEATURE-SPEC-F-FE-*.md` | Read, Grep, Glob, Write |
| **a11y-enforcer** | Any new component, modal, form, or interactive widget (PROACTIVE) | Read, Grep, Glob, Bash |
| **bundle-size** | After major dep additions; release-candidate builds | Read, Grep, Glob, Bash |
| **api-contract-guard** | New endpoint consumption / new typed payload (PROACTIVE) | Read, Grep, Glob, Bash |

## Backend-only agents intentionally dropped

| Backend agent | Why dropped on frontend |
|---|---|
| `tenant-isolation` | Tenant scoping is a server-side concern. The frontend never sees or sets `tenant_id`; it comes from the session. The relevant FE rule ("never send `tenant_id` in request bodies") is enforced by `api-contract-guard`. |
| `concurrency` | Race conditions and optimistic locking are server-resolved. The FE-relevant piece ("handle 409 Conflict with refresh + retry UX") folds into `code-enforcer` and the per-feature spec. |

## Source of truth

Every agent reads from:

1. `../ARCHITECTURE_BLUEPRINT.md` — §0 (SSOT) + §1 (FE specifics)
2. `../PROGRESS.md` — current sprint state (this directory)
3. `../CHANGELOG.md` — historical decisions
4. `../../prd.md` — product requirements
5. `../specs/FEATURE-SPEC-F-FE-*.md` — per-feature contracts
6. `../../change-art-backend/specs/FEATURE-SPEC-*.md` — paired backend contract (when relevant)

## Conflict resolution

When two agents disagree, this priority order applies (higher number wins):

1. PM (schedule)
2. Developer (sequencing)
3. Documentation
4. QA
5. a11y-enforcer
6. Architect
7. api-contract-guard
8. Security / Code Enforcer

**Security always wins.** A deadline never overrides a critical vulnerability or a WCAG AA blocker.
