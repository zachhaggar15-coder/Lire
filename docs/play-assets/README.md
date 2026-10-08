# Play Store graphics

The feature graphic is reusable. The screenshot files in this directory were
captured in August 2026 and show obsolete UI; do not upload them for 1.1.0 (9).
The final release pass delivers current production captures separately. Final
phone screenshots should represent the internal Play build and its real offer.

Original generation details (historical):

- **Feature graphic** — `node scripts/generate-play-assets.mjs`
- **Screenshots** — captured from the **production** build (`npm run build && npx next start -p 3100`)
  driving the installed Chrome, with the analytics-consent sheet and the
  onboarding walkthrough pre-dismissed via localStorage so the shots show the
  app rather than its first-run prompts.

## What to upload where

| Play Console field | File(s) | Size |
| --- | --- | --- |
| App icon | `../../android/store_icon.png` | 512×512 |
| Feature graphic | `feature-graphic-1024x500.png` | 1024×500, no alpha |
| Phone screenshots | `screenshots/phone-*.png` | 1080×1920 (9:16) |
| 7-inch tablet | `screenshots/tablet7-*.png` | 1200×1920 |
| 10-inch tablet | `screenshots/tablet10-*.png` | 1200×1920 |
| Chrome OS | `screenshots/chromeos-*.png` | 1920×1080 (16:9) |
| Android XR | `screenshots/xr-*.png` | 1920×1080 (16:9) |

Every aspect ratio sits inside Play's 16:9–9:16 band. Play requires a minimum
of two screenshots per form factor; five are provided for each.

## The five screens

1. **Lessons** — the level map and the recommended next lesson
2. **News** — the daily picks, showing real French text and level match
3. **Review** — spaced repetition
4. **Words** — saved vocabulary
5. **Premium** — the subscription page and price

> **VERIFY CURRENT GOOGLE PLAY REQUIREMENT.** Screenshot dimensions, counts and
> aspect-ratio limits change. Play Console shows the current rules inline while
> you upload; trust those over this file.
