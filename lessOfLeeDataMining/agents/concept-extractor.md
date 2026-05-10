# Agent Role: Concept Extractor

> Portable role brief for harnesses that support delegated agents or task-specialized sub-agents.
>
> If your harness does not support sub-agents, the main agent should read this file and apply it directly.

---

## Purpose

Identify and catalog the recurring ideas, phrases, and principles that form the intellectual backbone of Less of Lee. These are the concepts that could become chapter titles, section headers, or through-lines in a book.

---

## Read This First

Follow the skill defined in `skills/mining-loop.md` exactly. Read that file before doing anything else.

---

## Operating Boundaries

- **Read-only** on source material: never modify files in `../src/content/blog/`
- **Read** the post index and story beats for context
- Output goes to `data/concepts.json` and `reports/concepts.md`
- Every concept must reference supporting posts and beats
- Concepts are curated, not exhaustive — quality over quantity

---

## What Makes a Concept

A concept is a **recurring idea or phrase** that Lee returns to across multiple posts. It represents a belief, principle, or mental model that shapes his approach to health transformation.

Concepts are not tags. Tags categorize content; concepts represent ideas with depth.

**Concept indicators:**
- A phrase used repeatedly across posts (often as a title or heading)
- An idea explained from multiple angles over time
- A principle applied to different situations
- A mental model that evolves as Lee's journey progresses

---

## Known Seed Concepts

These are concepts already identified in the project definition. Confirm and expand:

- "I can't until I can"
- "Start where you are"
- "Fail your way to health"
- "Former diabetic"
- "Health is the destination"
- "Build your health"
- "No longer fragile"

---

## Record Schema

```json
{
  "concept_id": "i-cant-until-i-can",
  "name": "I can't until I can",
  "definition": "The principle that perceived impossibility transforms into capability through repeated small actions",
  "related_themes": ["discipline", "identity", "restart"],
  "supporting_posts": ["2012-04-14-i-can-wait-20", "2013-06-15-i-cant-until-i-can"],
  "supporting_story_beats": ["2013-06-15-i-cant-until-i-can--beat-01"],
  "candidate_chapters": ["The Impossible Becomes Routine"],
  "representative_quotes": [
    "Quote from post (under 30 words)"
  ],
  "first_appearance": "2012-04-14",
  "frequency": 12
}
```

---

## Expected Process

1. Read `data/posts.jsonl` for the full inventory
2. Read `data/story-beats.jsonl` for narrative context (when available)
3. Scan post titles and content for repeated phrases and ideas
4. For each candidate concept, verify it appears in 3+ posts
5. Fill all schema fields with evidence from the source material
6. Write `data/concepts.json` (array of concept objects)
7. Write `reports/concepts.md` (human-readable concept catalog)
8. Validate: all referenced post_ids exist, all quotes are verifiable

---

## Success Criteria

- Every concept appears in at least 3 posts (evidenced by `supporting_posts`)
- `representative_quotes` are real text from the referenced posts
- Concepts are distinct from each other (no two concepts that are really the same idea)
- The concept set, taken together, would give a reader a clear picture of Lee's philosophy
- Output is valid JSON

---

## Context Files To Read

1. `skills/mining-loop.md`
2. `project-definition.md` — concept card layer definition
3. `data/posts.jsonl` — post inventory
4. `data/story-beats.jsonl` — extracted beats (when available)
5. `data/tags.json` — controlled vocabulary (when available)
