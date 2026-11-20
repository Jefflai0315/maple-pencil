# 30-Day Drawing Challenge — Requirements

## Introduction

The current Playing with Pencil site is a portfolio that few visitors act on. The trace tool at `/copy` (point
your phone at paper, trace an image overlaid on the camera view) is the part people can actually use. This feature
turns the site into a web app built around that tool, with a game on top: the **30-Day Drawing Challenge**.

A player pays S$39 to join. Every day for 30 days they open that day's picture in the trace tool, draw it on paper
and snap a photo of the drawing. If the photo really is a new hand drawing that matches the picture, that day earns
S$1 into their in-app wallet. After Day 30 the wallet total (up to S$30) is refunded to the card or account they paid
with, in one refund. The other S$9 covers the lessons, the photo checks and payment fees. Because a player can never
get back more than they paid, faking drawings can't make money; the checks exist to keep the game fair.

It is for beginners who want a reason to draw every day and like a streak game with real stakes. Jeff runs it and
reviews the photos the automatic check is unsure about.

## Settings referred to below

All are set in one place on the server and can be changed without touching the rules:

| Setting | Value |
|---|---|
| Price | S$39.00 |
| Earned per passed day | S$1.00 |
| Challenge length | 30 days |
| Free-choice days | 7, 14, 21, 28 |
| Late-join cutoff | 20:00 local time |
| Shortest drawing time | 10 minutes |
| Checked submissions per day | 5 |
| Review time limit | 72 hours after the day ends |
| Match thresholds | pass ≥ 70, fail ≤ 40 (scores 0–100); between = review |
| Near-copy distance | image fingerprints differing in ≤ 6 of 64 bits |

## Requirements

### R1 — The homepage sells the app and the challenge

*As a visitor, I want the homepage to show me straight away what the app does and how the challenge works, so that
I can decide to start in under a minute.*

- 1.1 WHEN a visitor opens the homepage on a 375 × 667 screen THE SYSTEM SHALL show, without scrolling, a headline
  about the 30-Day Challenge, the price (S$39), the most that can be earned back (S$30), and a "Start the challenge"
  button.
- 1.2 WHEN a visitor opens the homepage THE SYSTEM SHALL show a "Try the trace tool free" link that opens the trace
  tool without signing in.
- 1.3 WHEN a visitor scrolls the homepage THE SYSTEM SHALL show how it works in three steps (trace, snap, earn) and
  answers to these questions: what counts as a valid day; what happens when a day is missed; when and how the money
  comes back; why it costs S$39 but pays back at most S$30; what the proof code is.
- 1.4 WHEN a signed-in player with an active challenge opens the homepage THE SYSTEM SHALL show a "Go to today"
  button that leads to their challenge board in place of the "Start the challenge" button.
- 1.5 WHEN a visitor opens the homepage THE SYSTEM SHALL show links to the commission, live-event and art-tech pages,
  and Jeff's contact details, in the footer.

### R2 — Joining and paying

*As a visitor, I want to sign in, read the rules and pay in a couple of taps, so that my challenge starts today.*

- 2.1 WHEN a visitor chooses "Start the challenge" while signed out THE SYSTEM SHALL ask them to sign in with Google
  and then return them to the join page.
- 2.2 WHEN a signed-in visitor opens the join page THE SYSTEM SHALL show the challenge rules and refund terms, and keep
  the pay button disabled until they tick that they accept the terms.
- 2.3 WHEN a signed-in visitor who has accepted the terms chooses to pay THE SYSTEM SHALL record their device's time
  zone and take them to a hosted payment page for exactly S$39.00, offering card and PayNow.
- 2.4 WHEN the payment provider confirms the payment THE SYSTEM SHALL create the player's challenge, with Day 1 being
  the player's local date at confirmation — or the next local date if confirmation came after the late-join cutoff.
- 2.5 WHEN a player returns from the payment page before the provider has confirmed THE SYSTEM SHALL show "confirming
  your payment" and switch to the challenge board once it is confirmed.
- 2.6 IF the payment provider reports the same payment more than once THEN THE SYSTEM SHALL keep exactly one challenge
  for that payment.
- 2.7 IF a second payment completes while the player already has an active challenge THEN THE SYSTEM SHALL refund the
  second payment in full and keep the existing challenge.
- 2.8 IF the player cancels, the payment fails, or a PayNow payment is not completed before the payment page expires
  THEN THE SYSTEM SHALL not create a challenge and SHALL show the join page with a message saying no money was taken.
- 2.9 IF a player who already has an active challenge opens the join page THEN THE SYSTEM SHALL not offer payment and
  SHALL send them to their challenge board.
- 2.10 WHEN a player's previous challenge has ended THE SYSTEM SHALL let them join a new one.

### R3 — Challenge days and the clock

*As a player, I want each challenge day to follow my own calendar day, so that "every day" means what I expect.*

- 3.1 THE SYSTEM SHALL use the time zone recorded at checkout for every day boundary for the whole challenge, even if
  the player's device later reports a different one.
- 3.2 THE SYSTEM SHALL treat Day N as running from local midnight at the start of the date N − 1 days after Day 1
  until the next local midnight (so a day can be 23 or 25 hours long when clocks change).
- 3.3 THE SYSTEM SHALL count a proof photo for the day in which it was received, whenever its result is decided, and
  SHALL accept photos only for the current day.
- 3.4 WHEN a day ends without a passed day or a day in review THE SYSTEM SHALL show that day as missed and it SHALL
  earn nothing.
- 3.5 WHEN a day is missed THE SYSTEM SHALL keep the challenge going so the player can still earn on later days.
- 3.6 WHEN Day 30 ends THE SYSTEM SHALL end the challenge and accept no more photos.

### R4 — The daily picture in the trace tool

*As a player, I want today's picture loaded into the trace tool for me, so that I can start drawing straight away.*

- 4.1 WHERE a day is a set-picture day THE SYSTEM SHALL give every player the same picture for that day number,
  together with its title and drawing tip.
- 4.2 WHERE a day is a free-choice day THE SYSTEM SHALL ask the player to load any picture of their own into the trace
  tool, and SHALL use that picture as the reference for that day.
- 4.3 THE SYSTEM SHALL make the free-choice days in the settings free-choice days, and every other day a set-picture
  day.
- 4.4 WHEN a player taps "Draw today" on their board THE SYSTEM SHALL open the trace tool with today's picture (or, on
  a free-choice day, the picture picker), showing the day number and today's proof code on screen.
- 4.5 WHILE a day has not started THE SYSTEM SHALL not reveal its set picture or proof code to that player.
- 4.6 WHEN a player first opens today's picture (on a free-choice day: first loads their own picture) THE SYSTEM SHALL
  record that time as the drawing start.
- 4.7 IF less than the shortest drawing time is left before the day ends WHEN a player opens today's picture THEN THE
  SYSTEM SHALL warn them that a photo can no longer be accepted today.

### R5 — Taking the proof photo

*As a player, I want to snap my finished drawing from inside the app, so that proving my day takes seconds.*

- 5.1 WHEN a day's picture is first opened THE SYSTEM SHALL give the player a random four-character proof code drawn
  from letters and digits that can't be confused (no 0, O, 1, I, L, 2, Z, 5, S, 8, B), never repeated within that
  player's challenge.
- 5.2 THE SYSTEM SHALL tell the player to write the proof code in a corner of their paper before snapping.
- 5.3 WHEN the player taps "Snap my drawing" THE SYSTEM SHALL take the photo from the live camera without the overlay,
  show it for confirmation, and let them retake or submit.
- 5.4 THE SYSTEM SHALL not offer any way to submit a proof photo picked from the gallery or files.
- 5.5 IF a proof photo is submitted before the shortest drawing time has passed since the drawing start THEN THE
  SYSTEM SHALL refuse it, without counting it as a checked submission, and say how many minutes are left.
- 5.6 IF a player has already made the day's limit of checked submissions THEN THE SYSTEM SHALL refuse further
  submissions that day and say so.
- 5.7 WHILE today is in review THE SYSTEM SHALL still accept new submissions within the day's limit; the first one
  that passes decides the day.
- 5.8 WHEN a proof photo is submitted THE SYSTEM SHALL show the result (passed, try again, or in review) within
  30 seconds, or else say that the check is taking longer and the result will appear on the board.

### R6 — The match check (no cheating)

*As Jeff, I want every proof photo checked automatically, so that only real new drawings of the day's picture earn
money.*

- 6.1 WHEN a proof photo is submitted THE SYSTEM SHALL score it on: whether it shows a hand drawing on paper; whether
  it shows a screen or printout; how closely the drawing matches the day's reference (0–100); and whether today's
  proof code is written on the paper.
- 6.2 IF the photo shows a screen or printout (including the reference picture shown on a screen), or is not a hand
  drawing on paper, THEN THE SYSTEM SHALL fail the submission.
- 6.3 IF the photo is within the near-copy distance of a proof photo that passed or is in review for any other day,
  from any player, THEN THE SYSTEM SHALL put the day in review (not fail it, because honest drawings of the same
  picture can look alike).
- 6.4 WHERE the day is a free-choice day, IF the chosen reference is within the near-copy distance of a reference or
  proof photo the same player used before, or is itself a photo of a hand drawing on paper, THEN THE SYSTEM SHALL fail
  the submission.
- 6.5 IF no proof code can be found THEN THE SYSTEM SHALL fail the submission; IF a code is found that differs from
  today's by exactly one character THEN THE SYSTEM SHALL put the day in review.
- 6.6 WHEN no check fails and the match score is at or above the pass threshold THE SYSTEM SHALL mark the day passed
  and add S$1 to the wallet.
- 6.7 WHEN the match score is at or below the fail threshold THE SYSTEM SHALL fail the submission.
- 6.8 WHEN a submission fails THE SYSTEM SHALL show the fixed message for each failed check (see table) and how many
  submissions are left today.
- 6.9 WHEN the match score is between the thresholds, or the checking service gives no answer within 25 seconds, THE
  SYSTEM SHALL put the day in review, keep the photo, and tell the player Jeff will look at it.
- 6.10 THE SYSTEM SHALL decide pass, fail or review on the server only; nothing the player's device sends SHALL set a
  day's result.

| Failed check | Message shown |
|---|---|
| Screen or printout | "This looks like a screen or a printout. Snap your drawing on paper." |
| Not a hand drawing | "We couldn't see a drawing on paper. Fill the frame with your page." |
| Reference reused or is a drawing (free day) | "Pick a new photo to draw from, not one you've used or drawn before." |
| Proof code missing | "We couldn't find today's code. Write it in a corner and snap again." |
| Low match | "Your drawing doesn't match today's picture closely enough. Keep going and snap again." |

### R7 — Jeff's review queue

*As Jeff, I want a short queue of the unsure photos, so that honest players aren't punished by a wrong automatic
check.*

- 7.1 WHEN an admin opens the review page THE SYSTEM SHALL list every day in review, oldest first, showing the proof
  photo, the reference picture, the expected proof code, the code the check read, the match score, the reason for
  review and the time left before the review time limit.
- 7.2 WHEN an admin approves a day in review THE SYSTEM SHALL mark it passed and add S$1 to that player's wallet, even
  if the day has ended.
- 7.3 WHEN an admin rejects a day in review THE SYSTEM SHALL mark it failed; IF the day has ended THEN it SHALL count as
  missed.
- 7.4 IF a day is still in review when the review time limit (counted from the end of that day) passes THEN THE SYSTEM
  SHALL mark it passed.
- 7.5 IF the challenge has been paid out or ended by a dispute THEN THE SYSTEM SHALL not allow approving or rejecting
  its days.
- 7.6 IF someone who is not an admin opens the review page or its actions THEN THE SYSTEM SHALL refuse access.
- 7.7 WHEN an admin opens the review page THE SYSTEM SHALL also list challenges whose payout needs attention and
  challenges ended by a dispute.

### R8 — The board, wallet and streak

*As a player, I want to see my progress like a game board, so that I want to come back tomorrow.*

- 8.1 WHEN a player opens their challenge board THE SYSTEM SHALL show 30 tiles, one per day, each marked passed,
  missed, in review, today or locked.
- 8.2 WHEN a player opens their challenge board THE SYSTEM SHALL show the wallet total (S$1 × passed days), the most
  the wallet can still reach (wallet + S$1 × each day not passed that has not ended or is in review), and the streak:
  consecutive passed days ending today or yesterday.
- 8.3 WHEN a day passes THE SYSTEM SHALL show a celebration with the wallet going up by S$1.
- 8.4 WHEN a player opens a passed tile THE SYSTEM SHALL show that day's proof photo next to its reference picture.
- 8.5 WHEN the challenge has ended THE SYSTEM SHALL show the final total and the payout status: waiting for reviews,
  paid (with date and amount), or needs attention.

### R9 — Payout after Day 30, and disputes

*As a player, I want my earned money back automatically after Day 30, so that I don't have to chase anyone.*

- 9.1 WHEN a challenge has ended and none of its days is in review THE SYSTEM SHALL refund the wallet total to the
  original payment, once.
- 9.2 IF the wallet total is S$0 THEN THE SYSTEM SHALL mark the payout complete without making a refund.
- 9.3 IF the payout runs more than once for the same challenge THEN THE SYSTEM SHALL refund at most once.
- 9.4 IF the payment provider refuses the refund THEN THE SYSTEM SHALL mark the payout as needing attention, and an
  admin SHALL be able to retry it.
- 9.5 THE SYSTEM SHALL never refund more than S$30 for one challenge, and SHALL not refund before the challenge has
  ended.
- 9.6 IF a dispute or chargeback is opened on a challenge's payment THEN THE SYSTEM SHALL end the challenge, cancel any
  payout not yet made, and accept no more photos for it.

### R10 — Safe, fresh and private data

*As a player, I want my progress and money shown correctly and my photos kept private, so that I can trust the game.*

- 10.1 WHEN a player opens their board or submits a photo THE SYSTEM SHALL use live server data, never an offline
  copy saved on the device.
- 10.2 IF a signed-out visitor calls any challenge action THEN THE SYSTEM SHALL refuse it.
- 10.3 IF a player tries to read or change another player's challenge THEN THE SYSTEM SHALL refuse it.
- 10.4 THE SYSTEM SHALL not show proof photos or free-choice references to anyone except the player who took them and
  admins.
- 10.5 WHEN an admin records a player's deletion request THE SYSTEM SHALL end their active challenge (if any), still
  pay out what was earned, and delete their photos once the payout is complete.

## Non-goals

- Daily reminder emails or push notifications (planned next; the board and the streak carry this version).
- A public gallery, leaderboard or sharing of proof photos.
- Paying out early, partial cash-outs, or paying out to anything but the original payment.
- Pausing a challenge, streak freezes or make-up days.
- Teams, group cohorts or friend challenges.
- A native iOS/Android app (the web app stays a PWA).
- Changes to how the trace tool works, apart from the challenge additions above.
- A self-serve delete-my-data button (Jeff records requests; see 10.5).
- Deleting the commission, live-event or art-tech pages.

## Constraints

- **Money:** amounts are handled in whole cents (S$39 = 3900). The price and the per-day amount come from the server
  settings; the player's device never sends an amount. Payments and refunds go only through the payment provider.
- **Payment provider:** must support SGD, card and PayNow, a hosted payment page, dispute notifications, and partial
  refunds of the original payment for at least 60 days after it was made.
- **Privacy (Singapore PDPA):** proof photos are stored privately, used only to run the challenge, and the terms say
  so. Secrets (API keys) are never committed to the repository.
- **Cost:** the automatic check runs at most 5 times per player per day.
- **Phone first:** every challenge screen works one-handed on a 375 px wide phone, in the existing PWA.
- **Domain:** no domain is hard-coded into new pages; the site works on whichever domain it is deployed to.

## Assumptions

- A1. "Return $1 per day" means S$1 for each passed day, with missed days kept by Playing with Pencil — not
  all-or-nothing.
- A2. The S$9 difference is non-refundable, and the terms say so.
- A3. Days 7, 14, 21 and 28 are the free-choice days (4 free, 26 set).
- A4. Jeff supplies the 26 set pictures before launch. The existing 5 face lessons become Days 1–5.
- A5. No grace period: a day closes at local midnight.
- A6. Ten minutes is the shortest believable drawing time, and 5 checked submissions a day is enough.
- A7. One active challenge per Google account at a time.
- A8. A day in review counts as done for its deadline, and an unanswered review passes after 72 hours, so a slow
  review never costs an honest player the day. This can't be abused for profit (see the introduction).
- A9. The admins are the email addresses in an admin list setting (Jeff to start with).
- A10. Stripe is the payment provider. Starts in test mode. Whether Stripe can partially refund a PayNow payment, and
  for how long, is checked before launch; if it can't, PayNow payouts fall to "needs attention" and Jeff pays them by
  hand.
- A11. The site keeps Google sign-in; no other login method is added.
- A12. The homepage revamp replaces both the old sketch homepage and the unfinished "playful" homepage now in the
  working tree, reusing the playful look (fonts, colours, doodles).
- A13. Free-choice days keep a small cheating risk (re-tracing an old picture), which is accepted because it can't
  make a profit; Jeff can switch them to set pictures in the settings.
- A14. Each player's own time zone is used (not fixed Singapore time), so overseas players get a fair day.
