# Feature Specs — Frontend

This folder holds the per-feature technical specifications for the Creative Production Management Platform frontend.

## How to write a new spec

1. Open a fresh AI session.
2. Paste **`AGENT_WORKFLOW.md`** (repo root), **`ARCHITECTURE_BLUEPRINT.md`** §0 (SSOT) + §1 (FE), and **`FEATURE_SPEC_TEMPLATE.md`** (this directory's parent) as the system context.
3. Pick the feature from `PROGRESS.md` (e.g. F-FE-006 Client Portal).
4. Issue the command: `generate spec: F-FE-006`.
5. The `feature-spec-author` subagent runs Phase 0 (clarifying questions) before producing the spec.
6. Once Phase 0 is complete and you've answered, the agent writes the spec to:
   `specs/FEATURE-SPEC-F-FE-[ID]-[kebab-name].md`
7. Commit the spec alongside the feature implementation.

## Spec → implementation handoff

When you start coding the feature, open a TASK MODE session and paste:

1. The SSOT (`ARCHITECTURE_BLUEPRINT.md` §0 + §1).
2. The completed `specs/FEATURE-SPEC-F-FE-[ID].md`.
3. (If consuming a backend endpoint) the matching `../change-art-backend/specs/FEATURE-SPEC-[F-ID].md`.

That's the full context. The Code Enforcer, a11y-enforcer, and api-contract-guard agents verify code against all three.

## Active spec list

| F-ID | Feature | Spec status | Sprint |
|---|---|---|---|
| F-FE-001 | Project Scaffold + Theme + 12 subagents       | _no spec needed (foundational)_ | S1 |
| F-FE-002 | Contracts Mirror + API Client + Socket Client | ⬜ not yet specced | S1 |
| F-FE-003 | Auth Module                                   | ⬜ not yet specced | S1 |
| F-FE-004 | Dashboard Layout                              | ⬜ not yet specced | S1 |
| F-FE-005 | Shared UI Primitives                          | ⬜ not yet specced | S2 |
| F-FE-006 | Client Portal                                 | ⬜ not yet specced | S2 |
| F-FE-007 | CS Panel                                      | ⬜ not yet specced | S2 |
| F-FE-008 | Team Lead Panel                               | ⬜ not yet specced | S3 |
| F-FE-009 | Designer Workspace (Jr + Sr)                  | ⬜ not yet specced | S3 |
| F-FE-010 | Digitator Workspace (Jr + Sr)                 | ⬜ not yet specced | S3 |
| F-FE-011 | Sewout Workspace                              | ⬜ not yet specced | S3 |
| F-FE-012 | QC Panel                                      | ⬜ not yet specced | S3 |
| F-FE-013 | Admin Panel                                   | ⬜ not yet specced | S4 |
| F-FE-014 | Notifications (in-app + FCM)                  | ⬜ not yet specced | S4 |
| F-FE-015 | Quote Negotiation UI                          | ⬜ not yet specced | S4 |
| F-FE-016 | Attendance UI                                 | ⬜ not yet specced | S4 |
| F-FE-017 | Analytics Dashboards                          | ⬜ not yet specced | S4 |
| F-FE-018 | PWA (offline shell + manifest + FCM SW)       | ⬜ not yet specced | S4 |
