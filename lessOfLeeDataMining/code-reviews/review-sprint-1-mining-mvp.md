# Data Review — Sprint 1 Book Mining MVP

**Date**: 2026-05-09
**Reviewer**: AI (skill: data-review, code-review hybrid)
**Scope**: Full Sprint 1 delivery — `scripts/build-mining-mvp.js` and all generated data/reports
**Diff base**: `879edee..83ae3a0`

---

## Architecture Summary

The MVP is a single 1,387-line Node.js script (`scripts/build-mining-mvp.js`) that reads 589 Markdown blog posts, parses frontmatter, applies a 13-tag controlled vocabulary via keyword heuristics, identifies 180 story candidates via title/paragraph/tag scoring, maps 12 seeded concepts to supporting posts, and generates both machine-readable data (JSONL/JSON) and human-readable reports (Markdown/CSV). It runs deterministically in ~2s with zero external dependencies beyond Node.js stdlib.

---

## Checks Run

| Command | Result |
|---------|--------|
| `node scripts/build-mining-mvp.js` | Pass (589 posts, 3341 tags, 180 stories, 12 concepts) |
| Determinism (run twice, compare MD5) | Pass (identical output) |
| JSON validity (parse all JSONL lines) | Pass (0 parse errors) |
| ID uniqueness | Pass (0 duplicates) |
| File path resolution | Pass (all 589 resolve) |
| Story excerpt source check | Pass (all excerpts found in source) |
| CSV row count | Pass (589 data rows + 1 header) |

---

## Spot-Check Results

| Record ID | Source Post | Date Match | Title Match | Word Count Plausible | Summary Quality |
|-----------|------------|------------|-------------|---------------------|-----------------|
| `2012-04-13-less-of-lee` | Exists | Yes | Yes | Yes (292 vs 298 raw wc) | Good — captures opening commitment |
| `2024-07-04-three-years-diabetes-free` | Exists | Yes | Yes | Yes (855 vs 863 raw wc) | Good — doctor quote lead |
| `2022-01-23-you-cant-do-ituntil-you-can` | Exists | Yes | Yes | Flagged: 74 words (raw wc=101 including frontmatter of ~27 words — plausible) | Adequate — short post |
| `2021-05-03-i8217m-back-8-years-later-8211-now-diabetic` | Exists | Yes | Yes — HTML entities decoded | Yes (328) | Good |
| `2023-12-06-14-days-with-no-food` | Exists | Yes | Yes | Yes (766) | Good |

---

## Findings

| ID | Severity | Category | Location | Problem | Proposed Fix |
|----|----------|----------|----------|---------|--------------|
| R001 | Med | Precision | Concept aliases — `feast-and-fast` uses alias `"fast"` | The single word "fast" matches 269 posts but many contain "fast" in unrelated contexts ("fast forward", "breakfast", "how fast"). 15 of 20 displayed supporting posts matched only on `["fast"]`. Inflates `frequency` significantly. | Add word-boundary matching (`\bfast\b`) or require alias minimum length of 4 chars, or require 2+ alias hits per post for short aliases. Same issue with `"i can"` alias on "I Can't Until I Can" (7 false-positive matches). |
| R002 | Med | Precision | Tag aliases — `capability-recovery` uses `"walk"`, `"run"` | Single common words without boundary matching tag 372 posts (63% of archive). "walk" matches "walked to the store" in unrelated contexts. | Require word boundary for short aliases (≤4 chars), or weight body-only short-word matches at lower confidence. |
| R003 | Med | Coverage | Story type classification | 128/180 candidates (71%) are classified as "transformation". Only 1 "relapse" and 4 "struggle" despite Lee's archive containing many honest setback posts. The classifier picks the type with the most keyword hits, and transformation words ("used to", "now", "from", "to", "before", "after") are nearly universal in reflective writing. | Add type-priority tiebreaking: if relapse/struggle words are present, prefer them over transformation. Or require transformation to score significantly higher (e.g., 3+ more hits). |
| R004 | Low | Schema | `data/post-tags.jsonl` stores `themes` as tag IDs in story candidates | The `themes` field in story-candidates.jsonl contains raw tag IDs like `"a1c-labs"` rather than human labels. The dashboard and reports display them raw. | Minor — the IDs are readable enough. Could optionally map to labels in reports. |
| R005 | Low | Completeness | Concept supporting_posts capped at 20 | All concepts with 26+ hits show exactly 20 `supporting_posts`. The `frequency` field is correct but you can't browse beyond the top 20. | Document that this is intentional (top-20 is sufficient for review). Or make configurable. |
| R006 | Low | Data Quality | 3 posts with very low word counts | `2022-01-15-the-weight-training-begins` (16 words), `2022-01-28-nsv-8211-clown-pants` (7 words), `2022-03-26-nsv-8211-new-jeans` (19 words). These are likely image-only or video-embed posts. | Flag these in the post record with a `content_type: "minimal"` field or exclude from story mining. Not a bug — just noise in the candidate pool. |
| R007 | Low | Code Quality | Single monolithic script (1,387 lines) | All data definitions (TAGS, CONCEPT_SEEDS, STORY_TYPE_RULES, DASHBOARD_QUESTIONS) are inline in the script. This makes it harder to iterate on vocabulary without touching extraction logic. | Extract TAGS, CONCEPT_SEEDS, STORY_TYPE_RULES into separate JSON/JS config files. Keep the pipeline script focused on logic. This is a Sprint 2 refactor, not a blocker. |
| R008 | High | Precision | Concept frequency inflated by short/common aliases | "The Feast And The Fast" (269 hits), "I Can't Until I Can" (266 hits), "Reclaiming Abilities" (189 hits) all have short aliases (`"fast"`, `"i can"`, `"reclaim"`, `"walk"`) that match broadly. 269/589 = 46% of posts allegedly mention "feast and fast" — this is clearly false-positive inflation. The concept layer's `frequency` number is unreliable as a quality signal. | Either: (a) require 2+ distinct alias matches per post, (b) add word-boundary regex for aliases ≤5 chars, or (c) separate `frequency` into `strong_matches` (title or 2+ aliases) and `weak_matches` (single short alias in body). This is the most important fix for the concept layer's usefulness. |
| R009 | Med | Usefulness | Dashboard answers return 8 items per question | The 8-item cap is arbitrary and some questions have 150+ qualifying candidates. More importantly, items aren't sorted by the user's most useful dimension (date for memoir arc, score for strongest material). | Add date-sorted and score-sorted views, or increase to top-15 with a "see full list in reports/story-candidates.md" pointer. |
| R010 | Low | Correctness | HTML entities in source_excerpt | Story `2012-04-13-less-of-lee--story-01` has `&#8243;` (inch mark entity) in source_excerpt. The excerpt comes from raw body before full decode. | Apply `decodeHtml()` to excerpts before writing. |
| R011 | Med | AgentFlow Compliance | Missing handoff files | The delivery updated `context.md`, `sprint-plan.md`, and `result-review.md` but did not write `code-reviews/review-*.md`. It also did not update the skill files or agents based on lessons learned (e.g., the validation skill now has a real script to reference). | This review fills the gap. Consider updating `skills/data-validation.md` to reference the validation built into the pipeline. |

---

## Lens Notes

| Lens | Findings | Justification if none |
|------|----------|-----------------------|
| A. Structural Integrity | (none) | All data files parse cleanly, IDs unique, counts match, CSV correct. |
| B. Referential Integrity | (none) | All post_id refs resolve, all file_paths exist, all tag IDs from vocabulary. |
| C. Content Accuracy | R010 | Spot-checks pass; word counts within expected tolerance of raw wc (frontmatter excluded). |
| D. Precision & False Positives | R001, R002, R003, R008 | Short/common aliases inflate tag counts and concept frequencies. Story type classification over-indexes on "transformation". |
| E. Completeness | R005, R006 | Minor: concept display cap and minimal-content posts. |
| F. Code Quality & Maintainability | R007 | Monolithic script with inline config. Functional but harder to iterate. |
| G. Usefulness for Book Mining | R009 | Dashboard useful but limited by item cap and sort order. Reports are comprehensive. |
| H. AgentFlow Compliance | R011 | Missing review artifact (now filled). Docs otherwise well-maintained. |

---

## Remediation Roadmap

### Fix Now (Blockers for usefulness)

- **R008 + R001** — Concept and tag alias precision. The frequency numbers are the main "interestingness" signal in the concept layer, and they're inflated by 2-10x for the top concepts. Without fixing this, the concept layer actively misleads about which ideas are truly recurring vs. which just contain the word "fast" or "walk".

### Fix Soon (High ROI, Sprint 2)

- **R003** — Story type rebalancing. 71% classified as "transformation" makes the type field nearly useless for filtering. A tiebreaker or threshold adjustment would make the type taxonomy actually useful.
- **R002** — Tag confidence for short aliases. Same root cause as R008 but for the tag layer. Affects tag count reliability.
- **R009** — Dashboard sort and item count. Quick win for usability.
- **R010** — HTML entity decode in excerpts. One-line fix.

### Fix Later (Refactors, Sprint 3+)

- **R007** — Extract config into separate files. Nice-to-have for iteration speed.
- **R005** — Configurable concept display cap. Low priority.
- **R006** — Minimal-content post flagging. Cosmetic.
- **R004** — Tag ID vs. label in reports. Cosmetic.

---

## What Works Well

This review would be incomplete without noting what the MVP does right:

1. **Deterministic and fast.** Same input → same output, ~2s runtime, zero network calls.
2. **Zero external dependencies.** Pure Node.js stdlib. No npm install needed.
3. **Validation built into the pipeline.** Self-checking output with clear pass/fail.
4. **Provenance preserved.** Every record traces back to a source file path.
5. **Honest framing.** Outputs are labeled "candidates", not "final beats". The caveats section in validation.md is well-written.
6. **Good HTML entity handling.** `decodeHtml()` covers the WordPress entity zoo (mostly — see R010).
7. **Dashboard answers real questions.** The five "Lee questions" are the right questions for book mining.
8. **Concepts are well-seeded.** The 12 concept definitions capture Lee's actual philosophy accurately.

---

## Recommended Next Steps for Codex

1. **Fix R008/R001**: Add word-boundary matching for aliases ≤ 5 characters. For concept frequency, require either a title match OR 2+ distinct alias hits in body to count as a supporting post.

2. **Fix R003**: In `classifyStory()`, add priority weighting — if `relapse` or `struggle` score ≥ 2 hits, prefer them over `transformation` even if transformation scores higher. Transformation is the "default bucket" and should require a meaningful lead.

3. **Fix R010**: Apply `decodeHtml()` to the output of `excerptFromParagraph()` before writing to JSONL.

4. **After fixes**: Re-run the pipeline and verify that concept frequencies drop to plausible ranges (e.g., "Feast And The Fast" should be 30-80, not 269) and story type distribution becomes more balanced.
