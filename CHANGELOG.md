# Changelog — Creative Production Management Platform (Frontend)

## Summary
Archived: 0 sessions | 4 features shipped (scaffold) | 14 features stubbed | 0 Tier 1 violations caught

## Entry format
[YYYY-MM-DD] | [Agent] | [TYPE] | [Description]

## Types
FEAT      — feature started, updated, or completed
FIX       — bug resolved
CHANGE    — scope or design changed
DECISION  — architectural or product decision (never archived)
DEADLINE  — deadline added, updated, at risk, or missed
BLOCKER   — blocker raised or resolved
TEST      — test coverage added, updated, or gap flagged
SCOPE     — something added to or cut from scope
DEFER     — feature moved to a future version
QUALITY   — code quality violation caught and corrected
DRIFT     — architectural drift detected and remediated
DEBT      — tech debt item raised or resolved
SECURITY  — security flag raised or resolved
THEME     — design-system token, component, or visual decision

---

## 2026-05-16 — Session 1

### Initialisation
- [PM Agent]       | DECISION | Frontend project initialised as sibling of `change-art-backend`.
- [Architect]      | DECISION | FE-D-000: SSOT inherited from `ARCHITECTURE_BLUEPRINT.md` v1.0 at repo root.
- [Architect]      | DECISION | FE-D-001: Default currency for v1 = INR.
- [Architect]      | DECISION | FE-D-002: AI Search topbar is non-functional placeholder for v1.
- [Architect]      | DECISION | FE-D-003: Dark theme is canonical; light theme toggle ships v1.1.
- [Architect]      | DECISION | FE-D-004: Better Auth client uses HTTP-only cookies via axios `withCredentials`; no token storage in JS.
- [PM Agent]       | DEADLINE | Sprint 1–4 + v1.0.0 frontend deadlines added.

### Agent system
- [Architect]      | DECISION | `.claude/agents/` seeded with 12 invokable subagents:
                      project-manager, architect, developer, qa-engineer, code-enforcer,
                      tech-debt, security, documentation, feature-spec-author,
                      a11y-enforcer (new — WCAG 2.1 AA), bundle-size (new — perf budget),
                      api-contract-guard (new — keeps FE bound to `@contracts`).
                      Backend's `tenant-isolation` and `concurrency` agents intentionally
                      dropped (BE-only concerns); their FE-relevant pieces fold into
                      `api-contract-guard` (cookie-vs-body tenant binding) and
                      `code-enforcer` (optimistic-lock 409 handling on mutations).

### F-FE-001 Project Scaffold
- [Developer]      | FEAT     | package.json + tsconfig (3 variants) + vite.config + tailwind.config + postcss.
- [Developer]      | FEAT     | .env.example + .gitignore + .prettierrc + .eslintrc.cjs.
- [Developer]      | FEAT     | index.html with Plus Jakarta Sans + IBM Plex Mono preloads.
- [Developer]      | THEME    | CSS variables ported verbatim from change_artwork_demo_v2.html
                      (crimson #C41E3A, navy #0A1628, gold #D4A843, glass-bg rgba(16,25,43,0.35),
                      heavy blur 48px, transition cubic-bezier(0.4,0,0.2,1) 0.22s, sidebar 230px,
                      radius 12px). Badge tokens for 8 variants + priority badges (normal/rush/super-rush).

### F-FE-002 Contracts + API + Socket
- [Developer]      | FEAT     | src/contracts mirrored from backend (enums, interfaces, events, error-codes).
- [Developer]      | FEAT     | src/lib/api-client.ts — axios with withCredentials, envelope unwrap, 409 toast.
- [Developer]      | FEAT     | src/lib/socket-client.ts — Socket.IO singleton, cookie-authenticated.
- [Developer]      | FEAT     | src/lib/fcm.ts — Firebase messaging registration wrapper.
- [Developer]      | FEAT     | src/lib/config.ts — Zod-validated env reader.

### F-FE-003 Auth (Better Auth client)
- [Developer]      | FEAT     | modules/auth/auth.service.ts — sign-in, sign-out, session refresh.
- [Developer]      | FEAT     | modules/auth/auth.store.ts — Zustand store with role + sub_type.
- [Developer]      | FEAT     | modules/auth/components/LoginForm.tsx — RHF + Zod, glass card matching demo login.
- [Developer]      | FEAT     | routes/auth/LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx.

### F-FE-004 Dashboard Layout
- [Developer]      | FEAT     | layouts/DashboardLayout.tsx — sidebar + topbar + content + mobile bottom nav.
- [Developer]      | FEAT     | layouts/RoleGuard.tsx — redirects to role's canonical home if mismatched.
- [Developer]      | FEAT     | shared-ui/Sidebar.tsx — role-driven nav config matches demo's ROLE_CFG.
- [Developer]      | FEAT     | shared-ui/Topbar.tsx — title + AI search placeholder + bell + theme toggle.
- [Developer]      | FEAT     | shared-ui/MobileBottomNav.tsx — 5-item nav for narrow viewports.
- [Developer]      | FEAT     | shared-ui/StatusBadge.tsx, ConfirmModal.tsx, NotificationBell.tsx (stubs).

### Module skeletons
- [Developer]      | FEAT     | 11 module folders stubbed with components/hooks/services/stores/types/index.ts:
                      auth, client-portal, cs-panel, team-lead, designer-workspace,
                      digitator-workspace, sewout-workspace, qc-panel, admin-panel,
                      notifications, shared-ui.
- [Architect]      | DECISION | FE-D-005: shadcn/ui copy-in deferred to S2; raw Tailwind + cva pattern used in S1.

### Tech debt registered
- [Tech-Debt]      | DEBT     | FE-DT-001..007 raised — covered in PROGRESS.md.
