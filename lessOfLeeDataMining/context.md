# lessOfLeeDataMining Session Context

> **Purpose**: Working memory for session continuity. If power drops, a new AI takes over, or we return after a break, read this first.

---

## Snapshot

| Attribute | Value |
|-----------|-------|
| **Phase** | Full Book Mining MVP precision remediation complete; ready for curated story beat review |
| **Mode** | 2 (Collaborative) |
| **Last Updated** | 2026-05-10 |

---

## What's Happening Now

### Current Focus

Sprint 1 plus the first precision remediation pass are complete. The project now has a deterministic local pipeline that indexes all WordPress posts, applies controlled tags, separates the two health journeys, mines heuristic story candidates, identifies recurring concept candidates, and generates Lee-facing reports.

Run it from `lessOfLeeDataMining/`:

```bash
node scripts/build-mining-mvp.js
```

### Recently Completed

- Added `use-cases.md` for book-writing workflows.
- Updated `project-definition.md` to cover MVP use cases and data layers.
- Added `architecture.md` for the local pipeline design.
- Built `scripts/build-mining-mvp.js`.
- Generated:
  - `data/posts.jsonl` (589 records)
  - `data/tags.json` (15 controlled tags)
  - `data/post-tags.jsonl` (2,950 links)
  - `data/story-candidates.jsonl` (180 candidates)
  - `data/concept-candidates.json` (12 concepts)
  - `reports/posts.csv`
  - `reports/book-mining-dashboard.md`
  - `reports/story-candidates.md`
  - `reports/concept-candidates.md`
  - `reports/validation.md`
- Validation passes with no failures.
- Determinism was checked by running the pipeline twice and comparing hashes.
- Added explicit journey tags:
  - `original-less-of-lee-journey`: 49 posts from 2012-04-13 through 2013-08-03.
  - `reversing-type-2-diabetes-journey`: 540 posts from 2021-05-04 through 2025-12-07.
- Remediated the review findings around broad alias matches, inflated concept frequencies, overuse of `transformation` story type, dashboard depth/sort, and HTML entities in excerpts.
- Remediated the follow-up code review findings:
  - dashboard scoring now uses full story tag membership via `all_themes`
  - journey display tags are preserved in story `themes`
  - validation reports journey story candidates across total tagged posts
  - determinism is documented as a release check rather than an in-pipeline check

### Decisions Locked

| Decision | Rationale | Date |
|---|---|---|
| Node.js for scripts | Matches parent Astro project; shared tooling | 2026-05-09 |
| JSONL for machine data | Streamable, line-diffable, appendable | 2026-05-09 |
| Slug-based stable IDs | Deterministic across re-runs, human-readable | 2026-05-09 |
| No paid APIs until structured layer exists | RAG/embeddings add value only after archive is legible | 2026-05-09 |
| `pubDate` is canonical | 216 filenames differ from post dates; source frontmatter is the source of truth | 2026-05-10 |
| Story outputs are candidates | The MVP is meant to find places to read first, not produce final manuscript beats | 2026-05-10 |
| Reports are the first interface | Lee can inspect Markdown/CSV without a web app yet | 2026-05-10 |
| Health journeys are era-derived tags | The original Less of Lee weight-loss journey and the Type 2 diabetes reversal journey are separate arcs, not just keyword topics | 2026-05-10 |
| Concept `frequency` means strong evidence only | Weak alias-only matches are retained separately so chapter ideas are not inflated by words like `fast`, `walk`, or `I can` | 2026-05-10 |

### Next Actions Queue

1. [REVIEW] Open `reports/book-mining-dashboard.md` and mark the most useful leads, starting with the Health Journey Split.
2. [CURATE] Promote selected records from `data/story-candidates.jsonl` into curated story beats.
3. [IMPLEMENT] Add a curated `data/story-beats.jsonl` layer with setup, conflict, turn, outcome, and lesson.
4. [EXPAND] Build timeline and candidate book maps after curated beats exist.
