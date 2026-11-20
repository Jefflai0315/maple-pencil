# 30-Day Drawing Challenge — Tasks

**Before task 1 (Jeff's call):** add `.env` to `.gitignore`, then commit the work already in the tree (homepage
pieces `SiteNav`, `SiteFooter`, `playful.css`, `/app`, waitlist, PayNow QR helper) so the challenge changes review
cleanly. Task 18 reuses `SiteNav`, `SiteFooter` and `playful.css`, so they must be committed, not set aside.

Tests live next to the code as `*.test.ts(x)`. **Route test** = Vitest + mongodb-memory-server, handler called
directly, with the session, `payments`, `judge` and `storage` mocked. **Render test** = Vitest + jsdom + Testing
Library. **Manual** = checked in the browser preview during the task, with a screenshot in the task's notes. Expected
values in tests are fixed literals (e.g. "paid 20:30 Singapore → Day 1 = next date"), never computed with the code
under test.

## Coverage

| Criterion | Test |
|---|---|
| 1.1 | Render test: headline, "S$39", "S$30", "Start the challenge" button; Manual: all visible at 375 × 667 |
| 1.2 | Render test: "Try the trace tool free" link has `href="/copy"`, visible signed out |
| 1.3 | Render test: three steps and the five FAQ topics |
| 1.4 | Render test: `useSession` signed in + `me` → `active` shows "Go to today" → `/challenge`, no "Start the challenge" |
| 1.5 | Render test (`SiteFooter`): links to the three services pages and contact |
| 2.1 | Render test: signed-out join page calls `signIn("google", { callbackUrl: "/challenge/join" })`; Manual round trip |
| 2.2 | Render test: pay button disabled until ticked; checkout route test: `acceptedTerms` missing → 400 |
| 2.3 | Checkout route test: `createCheckout` called for 3900 SGD, card + PayNow, `expires_at` = 60 min; zone saved; bad zone → 400 |
| 2.4 | Webhook route test: paid 10:00 SGT → Day 1 = that date; paid 20:30 SGT → next date; event 3 days old → Day 1 = processing date |
| 2.5 | `me` route test: open checkout 10 min old, no challenge → `confirming`; 61 min old → `none` |
| 2.6 | Webhook route test: same event delivered twice → one challenge |
| 2.7 | Webhook route test: second paid session while active → full refund, key `dup:<pi>`, still one challenge |
| 2.8 | Webhook route test: `async_payment_failed` and `expired` → no challenge; `me` route test → `failed`; render test: `?cancelled=1` shows "No money was taken" |
| 2.9 | Checkout route test: active challenge → 409 `{ redirect: "/challenge" }`, `createCheckout` not called |
| 2.10 | Checkout + webhook route tests: stored "active" challenge past Day 30 is ended and a new one created, no refund |
| 3.1 | Route test (`me`, `open`): challenge zone `Pacific/Auckland`, clock frozen where Auckland and Singapore dates differ → day number follows Auckland |
| 3.2 | `clock.test`: `Europe/London` spring day = 23 h, autumn day = 25 h; Day N end = Day N+1 start for all 30 |
| 3.3 | Submit route test: received 23:59:59, judge answers 00:00:05 → earlier day settled; first submit of a new unopened day → 409 |
| 3.4, 3.5 | `board.test`: ended day without pass/review → `missed`; following days `today`/`locked`; wallet unaffected |
| 3.6 | `board.test`: `isOver` from Day 30 end; submit route test after Day 30 → 409 |
| 4.1 | `curriculum.test`: every set day has title, tip, image file; picture route test: two players get the same bytes |
| 4.2 | Reference route test: free day stores it, set day → 409; submit route test: judge receives the stored reference |
| 4.3 | `curriculum.test`: free days = `SETTINGS.freeDays`, others set |
| 4.4 | Open route test returns day, content, code; Manual: `/copy?challenge=today` shows picture, day, code |
| 4.5 | Open route test before Day 1 → 409; picture route test: day not yet opened → 404 |
| 4.6 | Open route test: drawing start set once; reference route test: free day sets it at first reference |
| 4.7 | Open route test: 5 min before day end → `lateWarning: true`; 11 min → false |
| 5.1 | `proofCode.test`: alphabet, length 4, never in `used` (10 000 draws); open route test: same code on repeat, new code next day |
| 5.2 | Manual: pill shows the code and "write it in a corner" |
| 5.3 | Manual on a phone: snapped photo has no overlay |
| 5.4 | Static test: `onSnap(` called once in `ARTraceTool.tsx`, inside the handler drawing `videoRef.current`; render test: `ChallengeSnap` has no file input |
| 5.5 | Submit route test: 9 min after start → 425 with minutes left, `checked` unchanged, no upload |
| 5.6 | Submit route test: 6th → 429 and no upload call; 6 parallel → exactly 5 judged |
| 5.7 | Submit route test: day in review, next submission passes → `passed`; `repo.test`: `settleDay` never moves from `passed` |
| 5.8 | Render test: `ChallengeSnap` shows "taking longer" at 30 s (fake timers) |
| 6.1 | `judge.test`: request carries photo + reference; response parsed into `Verdict` |
| 6.2 | `decide.test`: `screenOrPrint` → fail `screen_or_print`; not a drawing → fail `not_drawing` |
| 6.3 | `decide.test`: near copy → review `possible_copy`; submit route test: pool = passed/review proofs of other days, any player |
| 6.4 | `decide.test`: → fail `bad_reference`; submit route test: reference pool = same player's earlier references and proofs only |
| 6.5 | `decide.test`: no code → fail; off by one (incl. 3- and 5-char reads) → review; off by two → fail |
| 6.6 | `decide.test`: all clear + score 70 → pass; submit route test: wallet 0 → 100 |
| 6.7 | `decide.test`: score 40 → fail `low_match` |
| 6.8 | `decide.test`: each reason → its exact message; submit route test returns messages + `checkedLeft` |
| 6.9 | `decide.test`: 41 and 69 → review, null verdict → review; submit route test (judge stub delays): still pending at 24 999 ms, review at 25 000 ms, photo kept |
| 6.10 | Submit route test: `result`, `day`, `score` fields in the body change nothing |
| 7.1 | Admin route test: queue oldest first with every listed field |
| 7.2 | Admin route test: approve after day ended → passed, wallet +100, photo results updated |
| 7.3 | Admin route test: reject ended day → tile `missed` |
| 7.4 | `board.test`: review 72 h after day end counts as passed; cron route test settles it (`timeout`); admin route test: action on expired review → 409 |
| 7.5 | Admin route test: approve on paid-out or disputed challenge → 409 |
| 7.6 | Admin route test: non-admin → 403 on GET and POST |
| 7.7 | Admin route test: attention lists failed, stuck-pending and disputed |
| 8.1, 8.2 | `board.test`: fixed fixture → exact tiles, wallet, possible, streak; `me` route test returns them |
| 8.3 | Manual |
| 8.4 | `me` route test: passed days have signed photo URL + `picture?day=N`; picture route test serves a past passed day |
| 8.5 | `me` route test: ended → total + payout status for waiting / paid / failed |
| 9.1 | Cron route test: ended, no review → one refund of the wallet amount |
| 9.2 | Cron route test: S$0 → `skipped`, no refund call |
| 9.3 | Cron route test: run twice → one refund; stuck `pending` settled via `existingRefund`, no second refund |
| 9.4 | Cron route test: refund throws → `failed`; admin route test: retry within 24 h → new refund with key `…:2` |
| 9.5 | `board.test`: wallet capped at 3000; cron route test: active challenge never refunded |
| 9.6 | Webhook route test: dispute → `disputed`; cron route test: no refund; submit route test → 409 |
| 10.1 | Config test (Workbox matching on full URLs, plus negative cases); route tests: `Cache-Control: no-store` |
| 10.2 | Route tests: every challenge and admin route signed out → 401 |
| 10.3 | Route tests: player B's session never returns or changes A's challenge |
| 10.4 | `storage.test`: uploads are `authenticated`; `me` route test: URLs signed, only own challenge |
| 10.5 | Admin route test: delete request → `withdrawn` (or immediate deletion when nothing unpaid); cron route test: photos and photo docs deleted after payout |

## Tasks

- [ ] **1. Test runner** — all tests
  - Tests first: `smoke.test.ts` (fails until the runner is set up).
  - Change: `vitest`, `mongodb-memory-server`, `jsdom`, `@testing-library/react`; `vitest.config.ts`; `npm test`.

- [ ] **2. Types, settings, clock** — R2.4, R3.1–3.3, R3.6, R4.7
  - Tests first: `clock.test.ts` (rows 2.4, 3.2, plus invalid zone, Day 30 end).
  - Change: `types.ts`, `settings.ts`, `clock.ts`.

- [ ] **3. Board state** — R3.4–3.6, R7.4, R8.1–8.2, R8.5, R9.1, R9.5
  - Tests first: `board.test.ts` (rows 3.4–3.6, 7.4, 8.1–8.2, 9.5; `payoutDue` with disputed / review left).
  - Change: `board.ts`.

- [ ] **4. Proof codes and decision table** — R5.1, R5.7, R6.2–6.9
  - Tests first: `proofCode.test.ts`; `decide.test.ts` (every row, reason and message; 40/41/69/70; null verdict with
    and without a step-1 fail).
  - Change: `proofCode.ts`, `decide.ts`.

- [ ] **5. Curriculum** — R4.1–4.3, R4.5
  - Tests first: `curriculum.test.ts`; `launch.test.ts` (skipped unless `LAUNCH=1`) fails while any placeholder
    image remains.
  - Change: `curriculum.ts`; Days 1–5 face images copied to `private/challenge/`; placeholders for the rest.

- [ ] **6. Adapters: fingerprint, judge, storage** — R6.1–6.4, R6.9, R10.4
  - Tests first: `fingerprint.test.ts`, `judge.test.ts` (Gemini mocked; bad JSON and abort throw), `storage.test.ts`.
  - Change: `fingerprint.ts`, `judge.ts`, `storage.ts`.

- [ ] **7. Database access** — R2.6–2.7, R2.10, R5.6–5.7, R7.2–7.5, R9.3–9.4, R9.6
  - Tests first: `repo.test.ts` (unique payment intent, one active per email, over challenge ended by
    `activeChallenge`, parallel `takeCheck`, `settleDay` guards, `claimPayout` from none/failed only, refused when
    disputed, attempt numbers).
  - Change: cached `getDb()` in `src/app/utils/mongodb.ts`; `repo.ts`; `ensureIndexes`.

- [ ] **8. Auth helpers** — R7.6, R10.2–10.3
  - Tests first: `auth.test.ts` (401 / 403 cases; nextauth route uses the moved `authOptions`).
  - Change: `src/lib/auth.ts`; nextauth route imports it.

- [ ] **9. Payments: checkout and webhook** — R2.2–2.4, R2.6–2.10, R3.1, R9.6
  - Tests first: checkout and webhook route tests (rows 2.2–2.4, 2.6–2.10, 9.6; bad signature → 400).
  - Change: `stripe` dependency; `payments.ts`; `api/challenge/checkout`; `api/stripe/webhook`.

- [ ] **10. Board data and pictures** — R1.4, R2.5, R2.8, R3.1, R4.1, R4.5, R8.1–8.2, R8.4–8.5, R10.1, R10.3–10.4
  - Tests first: `me` and picture route tests (none / confirming / failed / active / ended; signed URLs; past day
    picture; unopened day → 404; `no-store`).
  - Change: `api/challenge/me`, `api/challenge/picture`.

- [ ] **11. Today: open and reference** — R3.1, R3.3, R4.2, R4.4–4.7, R5.1
  - Tests first: open and reference route tests.
  - Change: `api/challenge/today/open`, `api/challenge/today/reference`.

- [ ] **12. Submit** — R3.3, R3.6, R4.2, R5.5–5.7, R6.1–6.10, R9.6, R10.3
  - Tests first: submit route tests (pre-check order and codes, check taken before upload, given back on upload
    failure, parallel limit, review then pass, 25 s timeout, both near-copy pools, body result ignored, wallet).
  - Change: `api/challenge/today/submit`.

- [ ] **13. Payouts** — R3.6, R7.4, R9.1–9.5, R10.5
  - Tests first: cron route tests (bad secret → 401, review timeout, amount, S$0, twice → once, stuck pending,
    failure, active never refunded, disputed skipped, withdrawn photos deleted after payout).
  - Change: `payout.ts` (`runPayout`); `api/cron/challenge-payouts`; `vercel.json`.

- [ ] **14. Admin API** — R7.1–7.7, R9.4, R10.5
  - Tests first: admin route tests (403, queue, approve/reject guards incl. expired review, photo results, retry
    payout with a new key, delete request both ways).
  - Change: `api/admin/challenge`.

- [ ] **15. Trace tool challenge prop** — R5.2–5.4
  - Tests first: static test for R5.4; render test that `ARTraceTool` without `challenge` shows no pill or snap button.
  - Change: `challenge` prop on `ARTraceTool` (pill, snap from `videoRef` only, original `File` to
    `onReferenceChosen`). Manual: pill text, snap without overlay on a phone.

- [ ] **16. Challenge drawing flow** — R4.4, R4.7, R5.3, R5.8, R6.8, R8.3
  - Tests first: `ChallengeSnap` render tests (no file input, confirm/retake, 30 s message, messages + checks left).
  - Change: `ChallengeTrace`, `ChallengeSnap`, `Celebration`; `copy/page.tsx` handles `?challenge=today`. Manual:
    set day and free day end to end, late warning, celebration.

- [ ] **17. Join, terms, board and admin pages** — R2.1–2.2, R2.5, R2.8–2.9, R7.1, R8.1–8.5, R9.4, R10.5
  - Tests first: join page render tests (signed-out sign-in call, checkbox gating, `?cancelled=1`).
  - Change: `/challenge/join`, `/challenge/terms`, `/challenge` with `Board`, `/admin/challenge`. Manual: board,
    confirming state, admin actions.

- [ ] **18. Homepage revamp** — R1.1–1.5
  - Tests first: `HomeLanding` and `SiteFooter` render tests (rows 1.1–1.5).
  - Change: `HomeLanding`, `page.tsx`, `SiteNav`, `SiteFooter`; delete `HomePlayful.tsx`, `ScrollStory.tsx`,
    `App_Sketch.jsx`. Manual: 375 × 667 above the fold.

- [ ] **19. Fresh data in the PWA** — R10.1
  - Tests first: config test (Workbox-style matching on full URLs, positive and negative cases).
  - Change: function-matcher `NetworkOnly` rules first in `next.config.ts`; rewrite the two dead RegExp rules.

- [ ] **20. Judge calibration script** — R6.6–6.9 thresholds
  - Tests first: `calibrate-judge.test.ts` on a three-photo fixture folder with `judge` mocked (confusion table
    counts).
  - Change: `scripts/calibrate-judge.ts`.
