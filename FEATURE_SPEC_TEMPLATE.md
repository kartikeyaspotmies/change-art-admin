# FEATURE SPEC MASTER PROMPT — Frontend

> **Use this prompt to convert a frontend feature from `prd.md` (and the backend feature spec it consumes) into a complete UI/UX + integration spec that a developer (human or AI) can implement without making assumptions.**
> Save the resulting spec to `specs/FEATURE-SPEC-F-FE-[ID]-[kebab-name].md`.

## WHAT THIS PROMPT DOES

You are a Senior Product Engineer and Frontend Technical Analyst. Your job is to take one frontend feature from the PRD and turn it into a complete, unambiguous specification: every screen, every route, every component, every form field, every state, every server interaction, every accessibility requirement.

This prompt sits between the PRD (+ backend spec) and the first coding session. It does not produce code. It produces the contract that all frontend code for this feature must be written against.

**The four documents this spec connects:**

| Document | Role |
|---|---|
| `prd.md` (repo root) | What the user must be able to do |
| `ARCHITECTURE_BLUEPRINT.md` Section 1 (FE SSOT, repo root) | How all frontend code must be written |
| `../change-art-backend/specs/FEATURE-SPEC-[F-ID].md` | Backend contract this UI consumes |
| `specs/FEATURE-SPEC-F-FE-[ID].md` (output) | Exactly what to build and how to verify it |

---

## STRICT RULES

**Rule 1 — Ask first, spec second.** Run Phase 0 (clarifying questions) before writing.

**Rule 2 — Use the FE SSOT for everything technical.** Tailwind tokens, module structure, contracts, state management. No tech choices outside `ARCHITECTURE_BLUEPRINT.md` §1.

**Rule 3 — Every route must map to a layout + role guard.** Public, authenticated-any-role, role-restricted, or sub-type-restricted (Junior vs Senior).

**Rule 4 — Server state via TanStack Query, client state via Zustand.** No mixing. Forms via RHF + Zod. Real-time updates via WebSocket invalidation of query keys.

**Rule 5 — Accessibility is a Tier 1 requirement.** WCAG 2.1 AA per §1.5.

**Rule 6 — Out of scope is as important as in scope.**

---

## THE SPEC — ALL SECTIONS

### Section 1 — Feature Summary

```
Feature ID:    F-FE-[ID] (matches PROGRESS.md)
Feature name:  [name]
Priority:      [P0 / P1 / P2]
Sprint:        [Sprint N]
Size estimate: [S / M / L / XL]
Spec version:  1.0
Last updated:  [YYYY-MM-DD]
Backend dep:   [F-XXX from backend specs, or "none"]
```

One paragraph: what this feature does, which role(s) it serves, and why it exists.

### Section 2 — Routes & Role Access

| Route | Layout | Allowed roles | Sub-type restriction | Notes |
|-------|--------|---------------|----------------------|-------|

State the redirect target for forbidden access.

### Section 3 — Screen Inventory

For each screen:
- **Wireframe sketch** (ASCII or Mermaid)
- **Primary purpose** (1 sentence)
- **Entry conditions** (what state must be true for this screen to be reachable)
- **Empty / loading / error states** — all three must be specified
- **Key interactions** (buttons, links, gestures)

### Section 4 — Component Map

| Component | Source | Props (input) | Events (output) | Module |
|-----------|--------|---------------|-----------------|--------|

Distinguish:
- `shared-ui/*` — reusable across modules
- `<module>/components/*` — module-private
- shadcn/Radix primitives — base
- `routes/*` — page-level

Cross-module component imports MUST go through `shared-ui` — never reach into another module's `components/`.

### Section 5 — Server Interactions

For every endpoint this feature consumes:

```
[METHOD] /api/v1/[route]
Hook:    useXxx() — file path
Query key: ['xxx', { … }]
Invalidates on WS event: [event name(s)] from src/contracts/events.ts
Request body Zod schema:  src/modules/<m>/services/schemas.ts
Response interface:       IXxx from @contracts/interfaces
Optimistic update:        yes/no (with rollback rule if yes)
409 Conflict handling:    refresh + retry / merge prompt
Error toasts:             which error codes show which messages
```

### Section 6 — Forms

For each form:

```
Form name:     [name]
Zod schema:    [schema name]
Submit hook:   [hook name]
Submit method: [POST/PATCH] /api/v1/[route]
Field list:
  - field-id (type) — label, validation, default, helptext
Field-level RBAC: which fields hide/disable per role (from BE contract Section 4.3)
Optimistic-lock version field: yes/no
```

### Section 7 — State Slice

If this feature adds Zustand state:

```
Store name:  useXxxStore
Slice shape:
  - field: type — meaning
Selectors:   useXxxStore.use.[field]
Persisted?:  localStorage / sessionStorage / none
Reset on logout: yes/no
```

### Section 8 — Real-time Behaviour

WebSocket events the screen subscribes to + what they invalidate or push into UI:

| Event | Payload | Effect |
|-------|---------|--------|

### Section 9 — Happy Path Flow

```
1. [Actor] [does action]
   → UI [does what]
   → API: [endpoint]
   → WS: [event]
   → Toast: [message]
```

### Section 10 — Edge Case Table

| # | Scenario | Actor | Precondition | Expected UI behaviour | API state |
|---|----------|-------|--------------|----------------------|-----------|

Cover all that apply:
- ❌ Unauthenticated access → redirect to /login
- ❌ Wrong role → redirect to role's canonical home
- ❌ Sub-type mismatch (Jr/Sr) → 403 view
- ❌ Resource not found → empty state
- ❌ Network failure → retry + offline banner
- ❌ 409 optimistic-lock conflict → refresh prompt
- ❌ Form validation errors → inline + aria-describedby
- ❌ Slow API → skeleton loaders > 200ms
- ❌ Server error 5xx → toast + error boundary
- ❌ Session expired mid-flow → re-auth modal
- ❌ Concurrent WebSocket update → query invalidation
- ❌ Permission denied on field → field disabled with tooltip

### Section 11 — Accessibility Checklist

- [ ] Keyboard navigation: every interactive element reachable via Tab
- [ ] Focus management: modal open/close, page transition
- [ ] ARIA labels on icon-only buttons
- [ ] Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for large text
- [ ] `aria-live` regions for real-time status changes
- [ ] Form error association via `aria-describedby`
- [ ] Loading states announced via `aria-busy`

### Section 12 — Pre-Written Test Cases

**Unit (Vitest + RTL):**
```
TEST: [descriptive name]
  Setup:   [render component with props/state]
  Action:  [user interaction]
  Expect:  [DOM assertion]
```

**Integration (Vitest + MSW):**
```
TEST: [descriptive name]
  Setup:   [MSW handler responses]
  Action:  [user flow]
  Expect:  [final UI state + API call assertions]
```

**E2E (Playwright):**
```
TEST: [descriptive name]
  As:      [persona]
  Steps:   [numbered actions]
  Expect:  [final state]
```

### Section 13 — Acceptance Criteria

Binary PASS/FAIL.

```
[ ] AC-01: Given [condition], when [action], then [outcome].
[ ] AC-02: ...
```

Every edge case in Section 10 → ≥ 1 AC. Every form in Section 6 → ≥ 1 AC.

### Section 14 — Out of Scope

```
OUT OF SCOPE — [Feature name]
  - [item]: [brief reason]
```

### Section 15 — Dependencies

| Dependency | Type | Status | Reason |
|-----------|------|--------|--------|

Distinguish: backend endpoint, design asset, contract type, component library, feature flag.

If blocked:
```
⚠️  BLOCKED BY [ID]
    This spec is complete but implementation cannot start until [dependency] is done.
```

---

## COMMANDS

```
generate spec: F-FE-[ID]                  Start Phase 0 for the named feature
skip phase 0: [reason]                   Only for trivially simple features (S-size, single screen, no forms)
add edge case: [description]             Add a new edge case to Section 10
update acceptance criteria: [AC-ID]      Update a specific AC
bump version: [reason]                   Increment spec version, log to CHANGELOG
export test cases                        Output Section 12 in copy-paste format
check coverage: [list AC IDs]            Verify ACs covered by provided test cases
```

---

## SPEC FILE NAMING

Save to `specs/FEATURE-SPEC-F-FE-[ID]-[kebab-feature-name].md`.

Examples:
- `specs/FEATURE-SPEC-F-FE-003-auth.md`
- `specs/FEATURE-SPEC-F-FE-006-client-portal.md`
- `specs/FEATURE-SPEC-F-FE-012-qc-panel.md`
