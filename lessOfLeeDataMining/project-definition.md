# Less Of Lee Data Mining - Project Definition

## Purpose

Build a durable, searchable, and book-oriented data layer over the Less of Lee WordPress article archive in `../src/content/blog`.

The project turns the archive into a source library for writing books: stories, scenes, themes, concepts, turning points, evidence, quotes, and chapter candidates.

## Product Goal

Lee should be able to open the generated reports and quickly answer:

- Where is the original Less of Lee weight-loss journey?
- Where is the Reversing Type 2 Diabetes journey?
- Where are my best diabetes reversal stories?
- Where are my fasting stories?
- Where are restart, failure, and comeback stories?
- Where are family and responsibility stories?
- What recurring Less of Lee ideas could become chapters?
- Which source post should I read next?

The system is successful when it helps Lee write from source truth instead of memory alone.

## Source Material

Primary source:

- `../src/content/blog/*.md`

These Markdown files are the downloaded WordPress articles. They are canonical raw source and must not be modified by mining scripts.

Related source material:

- `../src/assets/posts/` - downloaded images associated with posts
- `../scripts/scrape-wordpress.js` - WordPress.com RSS scraper
- `../scripts/convert-wordpress.js` - WordPress export converter

## Use-Case Coverage

Detailed use cases live in `use-cases.md`. The data model must support:

- transformation timeline reconstruction
- separation of the original Less of Lee weight-loss journey from the later Type 2 diabetes reversal journey
- diabetes reversal evidence
- fasting lessons and safety stories
- "I can't until I can" capability stories
- relapse, restart, and comeback stories
- family, marriage, and grandfather responsibility stories
- practical chapter material about food, exercise, fasting, and systems
- quote and Lee-ism discovery
- candidate book and chapter structure discovery
- source verification while writing

## Recommended Strategy

Use a layered, inspectable representation before introducing RAG or graph infrastructure.

RAG can be useful later for semantic search, but it should not be the first abstraction. The first task is to make the archive legible and structured.

The initial representation uses:

- simple local files
- stable IDs
- JSONL for machine processing
- JSON for curated dictionaries and grouped objects
- CSV and Markdown for human review
- explicit relationships between posts, tags, story candidates, concepts, and book-use labels

## MVP Data Layers

### 1. Canonical Post Index

One record per article.

Required fields:

- `id`
- `slug`
- `title`
- `date`
- `file_path`
- `word_count`
- `summary`
- `source_tags`
- `wordpress_url`
- `has_images`

Output:

- `data/posts.jsonl`
- `reports/posts.csv`

### 2. Controlled Vocabulary

A normalized tag set with aliases and descriptions.

Two journey tags are required and should partition the archive exactly once per post:

- `original-less-of-lee-journey`
- `reversing-type-2-diabetes-journey`

Required fields:

- `id`
- `label`
- `description`
- `aliases`
- `book_uses`

Output:

- `data/tags.json`

### 3. Post Tag Index

One or more tag records per post, based on source tags, title, and body keyword evidence.

Required fields:

- `post_id`
- `tag_id`
- `confidence`
- `evidence`

Output:

- `data/post-tags.jsonl`

### 4. Story Candidates

Heuristic candidates for reusable story material. These are not final story beats; they are source-backed places to read first.

Required fields:

- `story_id`
- `post_id`
- `title`
- `date`
- `type`
- `book_uses`
- `themes`
- `score`
- `source_excerpt`
- `why_it_matters`
- `file_path`

Output:

- `data/story-candidates.jsonl`
- `reports/story-candidates.md`

### 5. Concept Candidates

Recurring Less of Lee ideas and phrases with supporting posts.

Required fields:

- `concept_id`
- `name`
- `definition`
- `related_tags`
- `book_uses`
- `supporting_posts`
- `frequency`
- `representative_quotes`
- `candidate_chapters`

Output:

- `data/concept-candidates.json`
- `reports/concept-candidates.md`

### 6. Book Mining Dashboard

A Lee-facing entry point that groups useful source material by use case.

The dashboard must include a Health Journey Split section before story-mining questions so Lee can start from either major arc.

Output:

- `reports/book-mining-dashboard.md`

## Future Data Layers

Later iterations may add:

- curated story beats after human review
- timeline events
- candidate book maps
- semantic search or RAG over stable IDs
- graph-style relationship exploration

## Architecture

Implementation architecture lives in `architecture.md`.

The MVP is one deterministic Node.js pipeline:

```sh
node scripts/build-mining-mvp.js
```

It reads source posts, writes data files, generates reports, and records validation results.

## Guiding Principles

- Preserve source links back to original Markdown files.
- Prefer inspectable files over opaque systems.
- Treat tags as useful metadata, not the whole representation.
- Treat story candidates and concepts as the main book-mining units.
- Add RAG only after the archive has stable IDs, summaries, tags, and candidate records.
- Keep generated artifacts separate from source blog content.
- Do not modify `../src/content/blog`.
