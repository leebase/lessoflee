# Book Mining MVP Architecture

## Overview

The MVP is a local, deterministic data pipeline for turning `../src/content/blog/*.md` into book-mining indexes and reports.

It intentionally avoids paid APIs, embeddings, RAG, databases, and a web app. The first interface is a set of JSON/JSONL data files plus Markdown and CSV reports that Lee can inspect directly.

## Inputs

Primary input:

- `../src/content/blog/*.md`

Each source post is Markdown with YAML-like frontmatter. Source posts are read-only.

Related input:

- `../src/assets/posts/` for image existence checks

## Pipeline

One command runs the MVP:

```sh
node scripts/build-mining-mvp.js
```

The script performs these stages:

1. Read all Markdown posts from `../src/content/blog`.
2. Parse frontmatter and body text.
3. Build the canonical post index.
4. Apply a controlled vocabulary through keyword and title heuristics.
5. Add one era-derived health journey tag to each post.
6. Extract story candidates from high-signal posts and paragraphs.
7. Extract recurring concept candidates from seed phrases and aliases.
8. Generate machine-readable data files.
9. Generate human-readable reports.
10. Run validation and write `reports/validation.md`.

## Outputs

Machine-readable data:

- `data/posts.jsonl`
- `data/tags.json`
- `data/post-tags.jsonl`
- `data/story-candidates.jsonl`
- `data/concept-candidates.json`

Human-readable reports:

- `reports/posts.csv`
- `reports/book-mining-dashboard.md`
- `reports/story-candidates.md`
- `reports/concept-candidates.md`
- `reports/validation.md`

## Record Identity

Post IDs are stable and slug-based. For a file named:

```text
2023-03-25-i-have-arrived-at-a1c-of-52.md
```

The post ID is:

```text
2023-03-25-i-have-arrived-at-a1c-of-52
```

Story candidate IDs are deterministic:

```text
<post_id>--story-01
```

Concept IDs are normalized slugs:

```text
i-cant-until-i-can
```

## Data Flow

```text
src/content/blog/*.md
  -> parse frontmatter/body
  -> posts.jsonl
  -> tag vocabulary + post-tags.jsonl
  -> story-candidates.jsonl
  -> concept-candidates.json
  -> dashboard and reports
  -> validation report
```

## Heuristic Mining

The MVP uses transparent heuristics so results can be trusted and improved:

- title signals such as `A1c`, `fast`, `can't until I can`, `Saturday Push Day`, `restart`, `diabetes`, and `Pawpaw`
- source tags from WordPress frontmatter
- keyword aliases from `data/tags.json`
- boundary-aware alias matching so common fragments do not inflate tags and concepts
- tag `type` metadata so era partitions are distinguishable from topical tags
- one era-derived partition tag per post: original Less of Lee before 2021, Type 2 diabetes reversal from 2021 onward
- mantra aliases for Lee's recurring refrains, including `start where you are`, `make progress`, `a little more`, and `a bit farther`
- paragraph scoring for first-person tension, change, result, and lesson language
- concept seed phrases from the project definition and recurring title patterns, with strong and weak evidence separated

The outputs are candidates, not final editorial judgment.

## Validation

Validation runs in the pipeline and checks:

- source post count
- output record count
- JSON/JSONL parseability
- required field completeness
- unique IDs
- source file path existence
- post tag references
- every post has exactly one health journey tag
- story candidate source excerpts appear in source body
- CSV row count matches post count

Manual "test as Lee" review is recorded in `reports/validation.md`.
Determinism is verified as a release check by running the pipeline twice and comparing generated artifact hashes; it is not currently a self-check inside the pipeline.

## Boundaries

Allowed:

- scripts in `lessOfLeeDataMining/scripts`
- generated data in `lessOfLeeDataMining/data`
- reports in `lessOfLeeDataMining/reports`
- documentation updates in `lessOfLeeDataMining`

Not allowed:

- modifying source posts
- adding paid APIs
- adding external runtime dependencies
- presenting heuristic candidates as final manuscript material
