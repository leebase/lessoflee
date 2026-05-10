# Less Of Lee Data Mining - Project Definition

## Purpose

Build a durable, searchable, and book-oriented data layer over the Less of Lee WordPress article archive in `src/content/blog`.

The goal is not only to search posts, but to mine them for reusable book material: stories, scenes, themes, concepts, turning points, evidence, quotes, and chapter candidates.

## Source Material

Primary source:

- `../src/content/blog/*.md`

These Markdown files are the downloaded WordPress articles. They should be treated as the canonical raw source for mining.

Related source material:

- `../src/assets/posts/` - downloaded images associated with posts
- `../src/data/blog/` - AstroPaper sample/current content collection path
- `../scripts/scrape-wordpress.js` - WordPress.com RSS scraper
- `../scripts/convert-wordpress.js` - WordPress export converter

## Core Question

How do we represent the article archive so Lee can quickly find relevant stories, topics, and ideas for one or more books?

## Recommended Strategy

Use a layered, inspectable representation before introducing RAG or graph infrastructure.

RAG can be useful later for semantic search, but it should not be the first abstraction. The first task is to make the archive legible and structured.

The initial representation should be:

- Simple files
- Stable IDs
- JSONL for machine processing
- Optional CSV/Markdown reports for human review
- Explicit relationships between posts, story beats, concepts, timeline events, and possible chapters

## Data Layers

### 1. Canonical Post Index

One record per article.

Suggested fields:

- `id`
- `slug`
- `title`
- `date`
- `file_path`
- `word_count`
- `summary`
- `primary_theme`
- `secondary_themes`
- `people`
- `places`
- `health_topics`
- `life_events`
- `emotional_tone`
- `story_value`
- `practical_value`
- `book_relevance`
- `notable_quotes`

Output:

- `data/posts.jsonl`
- `reports/posts.csv`

### 2. Story Beat Index

One record per reusable story unit. A single article may contain several story beats.

Suggested fields:

- `beat_id`
- `post_id`
- `type`
- `setup`
- `conflict`
- `turn`
- `outcome`
- `lesson`
- `themes`
- `usable_for`
- `emotional_tone`
- `source_excerpt`

Output:

- `data/story-beats.jsonl`
- `reports/story-beats.csv`

### 3. Controlled Vocabulary

A curated list of normalized tags and themes.

Early candidate tags:

- `diabetes`
- `a1c`
- `former diabetic`
- `fasting`
- `extended fasting`
- `feasting`
- `keto`
- `carnivore`
- `exercise`
- `walking`
- `running`
- `strength training`
- `osteoarthritis`
- `pain`
- `mobility`
- `doctor visit`
- `lab results`
- `family`
- `grandfather`
- `marriage`
- `faith`
- `identity`
- `discipline`
- `relapse`
- `restart`
- `food addiction`
- `carb sensitivity`
- `recipes`
- `nsv`
- `i can't until i can`
- `start where you are`

Output:

- `data/tags.json`

### 4. Concept Cards

One record per recurring Less of Lee idea, phrase, or principle.

Examples:

- `I can't until I can`
- `Start where you are`
- `Fail your way to health`
- `Former diabetic`
- `Health is the destination`
- `Build your health`
- `No longer fragile`

Suggested fields:

- `concept_id`
- `name`
- `definition`
- `related_themes`
- `supporting_posts`
- `supporting_story_beats`
- `candidate_chapters`
- `representative_quotes`

Output:

- `data/concepts.json`
- `reports/concepts.md`

### 5. Timeline Index

Major events and transformation milestones.

Suggested fields:

- `date`
- `type`
- `label`
- `description`
- `related_posts`
- `themes`
- `book_arc`

Output:

- `data/timeline.json`
- `reports/timeline.md`

### 6. Candidate Book And Chapter Map

A working architecture for possible books.

Possible books:

- Memoir of health transformation
- Practical guide to reversing Type 2 diabetes through lived experience
- Mindset and identity book
- Fasting-focused book
- Faith, family, responsibility, and health reflections

Suggested fields:

- `book_id`
- `working_title`
- `premise`
- `audience`
- `chapter_candidates`
- `supporting_concepts`
- `supporting_story_beats`
- `open_questions`

Output:

- `data/books.json`
- `reports/book-map.md`

## Proposed Directory Structure

```text
lessOfLeeDataMining/
  project-definition.md
  data/
    posts.jsonl
    story-beats.jsonl
    tags.json
    concepts.json
    timeline.json
    books.json
  reports/
    posts.csv
    story-beats.csv
    concepts.md
    timeline.md
    book-map.md
  scripts/
    build-post-index.js
    extract-story-beats.js
    build-reports.js
```

## First Milestone

Create the canonical post index from `../src/content/blog`.

Minimum viable output:

- Parse Markdown files
- Extract frontmatter
- Compute slug, title, date, path, and word count
- Generate a short summary placeholder or extracted first-paragraph summary
- Write `data/posts.jsonl`
- Write `reports/posts.csv`

## Second Milestone

Mine story beats from the highest-value posts.

Start with a deterministic or semi-manual pass before automating deeply:

- Identify posts with strong titles or known themes
- Extract one or more story beats per post
- Score each beat for memoir value and practical value
- Begin linking beats to concepts and candidate chapters

## Later Enhancements

After the structured data exists, add semantic search or RAG:

- Chunk posts and story beats
- Embed chunks with stable IDs
- Support questions like "find stories about pain not meaning damage"
- Use structured metadata to filter results before semantic retrieval

Graph-style exploration can also be added later without adopting a graph database immediately. The JSON relationships are enough to begin:

- posts to themes
- posts to story beats
- story beats to concepts
- concepts to chapters
- timeline events to posts

## Guiding Principles

- Preserve source links back to the original Markdown files.
- Prefer structured, inspectable files over opaque systems.
- Treat tags as useful metadata, not the whole representation.
- Treat story beats and concepts as the main book-mining units.
- Add RAG only after the archive has stable IDs, summaries, tags, and story beat records.
- Keep generated artifacts separate from the source blog content.
