# Sprint Plan

---

## Sprint 1 — Canonical Post Index

**Goal**: Create one structured record per blog post with metadata, word count, and summary.

**Status**: Not Started

### Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| S1-01 | Build `scripts/build-post-index.js` | Not Started | Parse frontmatter, compute word count, extract first-paragraph summary |
| S1-02 | Generate `data/posts.jsonl` | Not Started | One JSON record per post |
| S1-03 | Generate `reports/posts.csv` | Not Started | Human-reviewable spreadsheet format |
| S1-04 | Validate output quality | Not Started | Spot-check 10+ posts for accuracy |
| S1-05 | Document decisions and update handoff docs | Not Started | context.md, result-review.md |

### Acceptance Criteria

- Every `.md` file in `../src/content/blog/` has exactly one record in `data/posts.jsonl`
- Each record has: `id`, `slug`, `title`, `date`, `file_path`, `word_count`, `summary`
- Records are sorted by date ascending
- No record has null/empty `title` or `date`
- `word_count` excludes frontmatter
- `reports/posts.csv` is generated from the JSONL and matches record count

---

## Sprint 2 — Controlled Vocabulary and Tagging (Future)

**Goal**: Define the normalized tag set and apply initial tags to all posts.

**Status**: Not Started — blocked on Sprint 1 completion

---

## Sprint 3 — Story Beat Extraction (Future)

**Goal**: Mine the highest-value posts for reusable story beats.

**Status**: Not Started — blocked on Sprint 1 + 2 completion
