# Children's Code (UK Age Appropriate Design Code) assessment — Sorlio 1.1.0

**Status: DRAFT for the controller's approval. Not legal advice.** Items marked
**[ADVICE]** need a qualified privacy adviser's view before launch. Facts
describe the code on `release/sorlio-production-hardening`.

## Scope

- **Is the Code likely to apply?** Yes. Sorlio is an information society
  service offered in the UK, aimed at learners "13 and over", and French is a
  school subject: children aged 13–17 are likely to use it.
- **Age approach chosen:** no age gate and no date of birth. Every user gets
  the protections suited to the youngest likely user (13). This avoids
  collecting age data at all, which the Code accepts where the service applies
  high privacy and child-appropriate design to everyone.
- **Under-13s:** not targeted. The privacy policy says the service is for 13+
  and that we delete an account on report. **[ADVICE]** Confirm that this,
  with no age assurance, is proportionate given the service's actual risk
  profile (below) and the Play target-audience declaration.

## The 15 standards

| # | Standard | How Sorlio meets it | Evidence | Residual risk / action |
|---|---|---|---|---|
| 1 | Best interests of the child | Product is a reading tool with no social features, no ads, no engagement loops beyond a streak count; privacy chosen over analytics | Removal of analytics, research prompts, beta list, Sentry (commit 529be1a and later) | Streak/goal nudges are gentle and dismissible; review in polish pass |
| 2 | Data protection impact assessment | DPIA drafted | docs/privacy/dpia.md | Controller to approve and sign |
| 3 | Age-appropriate application | One high-privacy experience for all ages | No DOB, no age-dependent features | **[ADVICE]** confirm the no-age-assurance approach |
| 4 | Transparency | Privacy policy opens with a plain-language "short version"; AI and sync explained at point of use | src/app/privacy/page.tsx; AI disclosure in the meaning/sentence sheets; sync options in Settings | Operator: Zachary Haggar, trading as Sorlio; identity and contact supplied for 8 October 2026 |
| 5 | Detrimental use of data | No profiling for marketing, no ads, no selling; recommendations are local and content-based | No ad/analytics SDKs; recommendation preferences stored on device | None known |
| 6 | Policies and community standards | Terms set a 13+ age and fair-use rules; AI answers have a Report button | src/app/terms/page.tsx; MeaningSheet "Report this AI answer" | A named person must review AI reports (operational) |
| 7 | Default settings | Most private by default: no account needed; imported-text sync off; no AI without an explicit Premium action; no notifications | `importedTexts` opt-in default false; Android permission set | None |
| 8 | Data minimisation | Only email + account ID for accounts; Google name/photo stripped (0012); feedback not linked to email; no device IDs | migration 0012; feedback route; privacy policy | Historical Google profile fields for 7 existing users await approved cleanup |
| 9 | Data sharing | No sharing; processors only | docs/play-data-safety.md | Confirm each processor's DPA (L03) |
| 10 | Geolocation | None collected; IP used only for ≤15-minute rate limiting | rateLimit.ts | None |
| 11 | Parental controls | None (no monitoring features) | — | Not applicable |
| 12 | Profiling | Off: no behavioural profiling. Reading-level estimates and recommendations are computed on the device for the reader's own use | src/lib/recommendation (local) | None |
| 13 | Nudge techniques | No dark patterns: Premium prompt defaults focus to "Not now"; no countdowns, no fake scarcity, no pre-ticked boxes; cancellation explained | AccessPrompt, Premium page | Polish pass to recheck copy for pressure |
| 14 | Connected toys and devices | Not applicable | — | — |
| 15 | Online tools | Delete account in-app and on the web; data requests by email; cancel subscription link | /account/delete; privacy policy rights section | Rights requests need an operated inbox and log (L06) |

## Specific risks for 13–17-year-olds and mitigations

| Risk | Mitigation | Remaining |
|---|---|---|
| Unsuitable literary content (violence, sexual themes, period racism) | Slur and scene exclusions; editorial matter removed; full read-through of two adventure works requested | Human content review (docs/review/public-domain-spot-check.md) not yet done |
| Unsuitable live news | News limited to four official public-sector sources (French government, EU Commission, EU Parliament) | Low |
| AI output inappropriate for teens | Safety rules in every prompt; material fenced as data; reportable answers; Premium-only | Output can still err; report queue must be watched |
| Imported private text leaking | Local by default; cloud sync opt-in; never sent to AI unless the reader asks; partitioned per account | None known |
| Paying without understanding | Price, renewal and cancellation stated before purchase; Google Play handles payment (and its own family/age controls) | **[ADVICE]** contract capacity of 13–17-year-olds for subscriptions under UK law |
| Shared family devices | Per-account partitions; sign-out keeps data separate; guest adoption asks first | None known |

## Questions for an adviser

1. Is "high privacy for everyone, no age assurance" proportionate here, or is some age assurance expected?
2. Subscription contracts with 13–17-year-olds: wording of the Terms and any refund expectations.
3. Whether the AI feature (OpenAI, US processing) needs additional child-specific safeguards or transfer measures.
4. Retention periods (feedback 12 months, AI counters 30 days, deletion records 180 days): proportionate?

Approved by (controller): ______________________ Date: __________
