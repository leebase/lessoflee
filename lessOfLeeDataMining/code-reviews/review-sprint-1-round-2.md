# Data Review — Sprint 1 Round 2 (Post-Remediation)

**Date**: 2026-05-09
**Reviewer**: AI (skill: data-review)
**Scope**: Two remediation commits after initial review: `828d766 fix: improve mining precision` and `e8d90e6 fix: remediate mining review findings`
**Prior review**: `code-reviews/review-sprint-1-mining-mvp.md`

---

## Architecture Summary

Same pipeline, significantly improved precision layer. Key changes: word-boundary matching for short aliases, an ambiguous-alias registry, strong/weak evidence separation for concepts, story type classifier tiebreaking, HTML entity cleanup in excerpts, journey-era partitioning tags, and `all_themes` for dashboard scoring.

---

## Checks Run

| Command | Result |
|---------|--------|
| `node scripts/build-mining-mvp.js` | Pass (589 posts, 2950 tags, 180 stories, 12 concepts) |
| Determinism (run twice, compare MD5) | Pass |
| JSON validity | Pass |
| ID uniqueness | Pass |
| File path resolution | Pass |
| Story excerpt entity scan | Pass (0 HTML entities in excerpts) |
| CSV row count | Pass |

---

## Prior Finding Remediation Status

| Prior ID | Issue | Status | Verification |
|----------|-------|--------|--------------|
| R001 | Short alias "fast" inflates concept frequency | **Fixed** | "Feast And The Fast" frequency: 269 → 6. Word-boundary + ambiguous alias registry working. |
| R002 | Short tag aliases "walk"/"run" inflate tag counts | **Fixed** | `capability-recovery`: 372 → 239. `nsv`: 335 → 84. `failure-restart`: 225 → 88. Boundary matching effective. |
| R003 | Story type classifier 71% "transformation" | **Fixed** | Now: victory 78, struggle 47, relapse 19, wisdom 18, relationship 13, transformation 3. Well-balanced. |
| R004 | Tag IDs vs labels in reports | **Not addressed** | Still using IDs in themes. Low priority — IDs are readable. |
| R005 | Concept supporting_posts capped at 20 | **Not addressed** | Still capped. Low priority. |
| R006 | 3 minimal-content posts not flagged | **Not addressed** | Still present. Low priority. |
| R007 | Monolithic script with inline config | **Not addressed** | Script grew from 1,387 to ~1,600 lines. Still functional. Sprint 2 refactor candidate. |
| R008 | Concept frequency inflated by short aliases | **Fixed** | "I Can't Until I Can": 266 → 36. Strong/weak separation implemented. |
| R009 | Dashboard limited to 8 items | **Improved** | Journey-filtered questions now report across tagged post counts. |
| R010 | HTML entities in source_excerpt | **Fixed** | Zero entities found in excerpts. |
| R011 | Missing review artifact | **Fixed** | Codex self-review at `code-reviews/review-sprint-1r-mining-precision.md`. |

**Summary**: 6 of 7 actionable findings fixed. 4 low-priority items remain by design.

---

## New Findings

| ID | Severity | Category | Location | Problem | Proposed Fix |
|----|----------|----------|----------|---------|--------------|
| R2-001 | ~~Med~~ **Retracted** | Precision | Concept `start-where-you-are` — aliases `"make progress"` and `"a little more"` | **Retracted.** Reviewer assumed these were generic English, but Lee confirmed they are deliberate mantras repeated throughout the blog. 143 matches is accurate signal, not false-positive inflation. The concept aliases correctly capture Lee's recurring vocabulary. |  No action needed. |
| R2-002 | ~~Med~~ **Retracted** | Precision | Concept `hard-is-mandatory` (83 strong matches, 14%) | **Retracted.** Same reasoning as R2-001. Lee's concepts are expressed through repeated phrases that may look generic out of context but are intentional mantras in the archive. The frequency counts reflect real usage. | No action needed. |
| R2-003 | Low | Design | `reversing-type-2-diabetes-journey` tag — 540 posts (92%) | This is a date-based partition tag, not a keyword tag. Every post from 2021+ gets it regardless of content. That's architecturally fine (it's an era marker), but it inflates the tag distribution and makes it look like a precision problem at first glance. | Add a `type: "partition"` field to distinguish era tags from keyword tags in `tags.json`. Or document this clearly in architecture.md. Not a bug — just confusing on first read. |
| R2-004 | Low | Code Quality | `scripts/build-mining-mvp.js:1023` | Per Codex's own review (R004): `bodyAmbiguousAliases` and `relatedStrongTags` variables are calculated but unused. Marked as remediated in Codex's review header, but I can still see them in the code. | Verify whether these were actually removed in e8d90e6 or just documented as intended-to-remove. |
| R2-005 | Low | Completeness | Story type "transformation" now only 3 candidates | The tiebreaker fix may have over-corrected. Transformation requires a 3-point lead over the best non-transformation type, which is a high bar. Some posts that genuinely describe before/after change are now classified as "victory" or "struggle". | Not necessarily wrong — victory and struggle may be more specific labels. But worth monitoring. If Lee finds missing transformation stories, lower the threshold from +3 to +2. |

---

## Lens Notes

| Lens | Findings | Justification if none |
|------|----------|-----------------------|
| A. Structural Integrity | (none) | All files parse, counts match, IDs unique, deterministic. |
| B. Referential Integrity | (none) | All references resolve. Post-tag pairs are unique (verified). |
| C. Content Accuracy | (none) | Prior spot-checks still valid; HTML entity fix confirmed. |
| D. Precision & False Positives | R2-003 | Short-alias precision is fixed. R2-001/R2-002 retracted — Lee confirmed the multi-word phrases are deliberate mantras, not false positives. |
| E. Completeness | R2-005 | Minor over-correction in story type balance. |
| F. Code Quality | R2-004 | Dead variables from Codex's own review. |
| G. Usefulness for Book Mining | (none) | Dashboard, reports, and concept cards are substantially more useful now. The strong/weak concept split is the right design. |

---

## Remediation Roadmap

### Fix Later

- **R2-003**: Document or type-flag the partition tags. Cosmetic.
- **R2-004**: Remove dead variables. Trivial cleanup.
- **R2-005**: Monitor during real use. Only fix if Lee reports missing transformation stories.

---

## Overall Assessment

The remediation was thorough and well-executed. The main precision problems from the initial review (R001/R008 concept inflation, R003 story type imbalance, R010 HTML entities) are all genuinely fixed, not papered over. Codex also did its own self-review before the final commit, which caught a real scoring bug (themes truncation hiding journey tags from dashboard scoring) and fixed it.

The remaining issues are cosmetic items (partition tag documentation, dead variables, transformation threshold monitoring). The data is now substantially trustworthy for book mining.

**Reviewer correction**: R2-001 and R2-002 were retracted after Lee clarified that phrases like "make progress" and "a little more" are deliberate mantras repeated throughout the blog. The high concept frequencies reflect real, intentional usage — not false positives. This is an important lesson for the review process: domain knowledge from the author trumps statistical intuition from the reviewer. Future reviews of this archive must consult Lee before flagging concept aliases as imprecise.

**Recommendation**: The MVP is ready for Lee to use as a discovery tool. The next high-value work is Lee interacting with the dashboard and story candidates — deciding which leads are worth promoting to curated story beats.
