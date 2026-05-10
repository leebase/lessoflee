# Sprint Plan

---

## Sprint 1R - Mining Precision Remediation

**Goal**: Address the first data review findings so the MVP is safer to use for actual book mining.

**Status**: Done

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| S1R-01 | Fix broad alias matching | Done | Boundary-aware alias matching; weak single-word hits separated |
| S1R-02 | Rework concept support counts | Done | `frequency` now means strong matches; weak matches remain visible |
| S1R-03 | Rebalance story type classification | Done | `relapse`, `struggle`, `relationship`, and `identity` no longer get swallowed by `transformation` |
| S1R-04 | Improve dashboard usefulness | Done | Top matches plus memoir arc views; journey split added |
| S1R-05 | Separate health journeys | Done | Original Less of Lee: 49 posts; Reversing Type 2 Diabetes: 540 posts |
| S1R-06 | Validate regenerated artifacts | Done | Pipeline, syntax, excerpt entity scan, CSV count, and determinism checks pass |

---

## Sprint 1 - Full Book Mining MVP

**Goal**: Build the first usable book-mining layer over all 589 WordPress posts.

**Status**: Done

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| S1-01 | Write book-mining use cases | Done | `use-cases.md` defines Lee-facing writing workflows |
| S1-02 | Update project definition | Done | `project-definition.md` now covers MVP layers and use cases |
| S1-03 | Create architecture document | Done | `architecture.md` defines pipeline, outputs, validation |
| S1-04 | Build MVP pipeline script | Done | `scripts/build-mining-mvp.js` |
| S1-05 | Generate machine-readable data | Done | posts, tags, post-tags, story candidates, concepts |
| S1-06 | Generate Lee-facing reports | Done | dashboard, posts CSV, story/concept reports |
| S1-07 | Validate and test as Lee | Done | automated validation plus report usefulness checks |
| S1-08 | Update AgentFlow handoff docs | Done | context.md and result-review.md |

### Acceptance Criteria

- `data/posts.jsonl` has exactly one record per `.md` file in `../src/content/blog/`
- Source post count is 589
- Every post record has `id`, `slug`, `title`, `date`, `file_path`, `word_count`, `summary`, `source_tags`, `wordpress_url`, and `has_images`
- `data/tags.json` contains the controlled vocabulary used by post and story records
- `data/post-tags.jsonl` references only valid post IDs and tag IDs
- `data/story-candidates.jsonl` contains source-backed story candidates with excerpts that appear in the source post
- `data/concept-candidates.json` contains recurring concepts with supporting post IDs
- `reports/posts.csv` row count matches `posts.jsonl`
- `reports/book-mining-dashboard.md` answers the core Lee questions from `use-cases.md`
- `reports/validation.md` records automated checks and manual "test as Lee" review
- Re-running the pipeline is deterministic

---

## Sprint 2 - Curated Story Beats

**Goal**: Promote high-quality story candidates into curated story beat records with setup, conflict, turn, outcome, and lesson.

**Status**: Next

---

## Sprint 3 - Timeline And Book Maps

**Goal**: Build transformation timeline events and candidate book/chapter maps from validated posts, tags, stories, and concepts.

**Status**: Future - blocked on Sprint 2

---

## Sprint 4 - Semantic Search

**Goal**: Add optional semantic search or RAG over stable IDs after the structured layer is trusted.

**Status**: Future - blocked on structured data quality
