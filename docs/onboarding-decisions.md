# Onboarding automation — decisions log

Decisions that govern what the automation does. Each one needs an owner and a
date before the behaviour it describes can be considered settled.

**Source-of-truth order when sources disagree:**

1. The legacy Apps Script code in `legacy/onboarding-apps-script/` — it is what
   People & Culture have actually been running.
2. An explicit P&C decision recorded in this file.
3. The public guide at onboardingautomation.netlify.app — descriptive, not
   authoritative. It diverges from the code in several places. Nothing is built
   from the guide alone without a decision recorded here.

---

## Open

| # | Decision | Options | Owner | Status |
|---|---|---|---|---|
| 1 | Induction task source | (a) in-app submission form, or (b) temporary Notion read-sync keeping `canonicalizeTaskName` | P&C | Open |
| 2 | Slack channel creation day | DOJ (legacy) or DOJ−1 (current port) | P&C | Open |
| 3 | Milestone cadence | Single 3-month email (legacy code) or 30/60/90 reviews (guide) | P&C | Open |
| 4 | Induction kickoff email | DOJ+1 (legacy code) or DOJ (guide) | P&C | Open |
| 5 | Guide-only Slack messages | Day-1 buddy reminder, manager conflict DM, 90-day manager DM — build or drop | P&C | Open |
| 6 | `ftc` treated as staff for induction | See note below | P&C | Open |
| 7 | Cutover owner and 30-day rollback window | — | Eng + P&C | Open |
| 8 | Cron time | 08:00 IST (legacy code, current) or 08:30 (guide) | P&C | Open |

### Note on #6 — `ftc`

The legacy script matched the literal keyword `contract` against the employee
type and department, which meant anything containing "contract" skipped
induction and all four onboarding calls.

The port currently labels `ftc` as "Fixed Term Employee" so it does **not**
match that keyword, and FTC staff therefore receive the full induction. Two
facts pull in opposite directions:

- `employee_types` seeds `ftc` as **"Full-Time Consultant"** — a consultant,
  which argues for the legacy behaviour of skipping.
- `employees.appraisal_eligible` is generated as `employee_type in ('fte','ftc')`
  — the schema treats FTC as staff, which argues for including them.

There is a second divergence in the same place. The legacy script chose who got
a 3-month milestone email by matching the string `full-time` — and
"Full-Time Consultant" contains it, so FTC staff **did** receive one. The port
restricts the milestone to `intern` and `fte`, so they now do not.

So the port currently gives FTC staff *more* than legacy (full induction) and
*less* (no milestone). Both follow from the same relabelling and should be
settled together.

This is a business rule, not an engineering one. Until P&C decides, the port's
behaviour stands and is covered by a test, so changing it is deliberate rather
than accidental.

---

## Settled

| # | Decision | Outcome | Owner | Date |
|---|---|---|---|---|
| A | `dry_run` semantics | Writes nothing to `onboarding_steps`; the expiry sweep runs only in `sandbox` and `live`. Journey sync still runs in `dry_run`, because a shadow run needs journeys to exist before it can project anything. | Nitin | 2026-10-15 |
| B | Credential and merge emails | Never auto-sent. Surfaced for a human to send, so no account password is stored by this application. | Eng | 2026-10-14 |
| C | Onboarding RBAC gate | Applied to the onboarding page, not the `/onboarding` layout, so `/onboarding/review/[token]` stays reachable by candidates holding an invitation token. | Eng | 2026-10-14 |
