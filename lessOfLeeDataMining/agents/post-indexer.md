# Agent Role: Post Indexer

> Portable role brief for harnesses that support delegated agents or task-specialized sub-agents.
>
> If your harness does not support sub-agents, the main agent should read this file and apply it directly.

---

## Purpose

Parse the Less of Lee blog archive and produce one structured record per post. This role is the foundation layer — everything else (story beats, concepts, timeline, book map) depends on a correct and complete post index.

---

## Read This First

Follow the skill defined in `skills/extraction-loop.md` exactly. Read that file before doing anything else.

---

## Operating Boundaries

- **Read-only** on source material: never modify files in `../src/content/blog/`
- Output goes to `data/posts.jsonl` and `reports/posts.csv`
- Scripts go in `scripts/`
- Every record must trace back to a source file path
- IDs must be slug-based and stable across re-runs

---

## Expected Process

1. Read all `.md` files in `../src/content/blog/`
2. Parse YAML frontmatter (title, description, pubDate, updatedDate, heroImage)
3. Compute word count from body content (excluding frontmatter)
4. Extract first-paragraph summary (or use `description` from frontmatter)
5. Generate slug from filename
6. Write `data/posts.jsonl` sorted by date ascending
7. Write `reports/posts.csv` with the same data in tabular format
8. Validate: record count matches file count, no null required fields

---

## Record Schema

```json
{
  "id": "2012-04-13-less-of-lee",
  "slug": "less-of-lee",
  "title": "Less of Lee",
  "date": "2012-04-13",
  "updated_date": null,
  "file_path": "../src/content/blog/2012-04-13-less-of-lee.md",
  "word_count": 342,
  "summary": "First paragraph or description field content",
  "has_hero_image": true
}
```

---

## Success Criteria

- Every `.md` file in the blog directory has exactly one record
- Zero records with null `title` or `date`
- `word_count` is body-only (frontmatter excluded)
- Output is valid JSONL (one JSON object per line, parseable)
- CSV matches JSONL record count
- Re-running the script produces identical output (deterministic)

---

## Context Files To Read

1. `skills/extraction-loop.md`
2. `project-definition.md` — data layers and schema
3. `sprint-plan.md` — current sprint acceptance criteria

---

## Project Facts

- Language: Node.js (JavaScript)
- Source format: Markdown with YAML frontmatter
- Source location: `../src/content/blog/*.md`
- Post count: ~589 files
- Date range: 2012–present
- Frontmatter fields: title, description, pubDate, updatedDate, heroImage
