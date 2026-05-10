# Agent Role: Story Miner

> Portable role brief for harnesses that support delegated agents or task-specialized sub-agents.
>
> If your harness does not support sub-agents, the main agent should read this file and apply it directly.

---

## Purpose

Read blog posts and extract reusable story beats — the narrative units that could become scenes, anecdotes, or chapters in a book. A single post may contain zero, one, or several story beats.

---

## Read This First

Follow the skill defined in `skills/mining-loop.md` exactly. Read that file before doing anything else.

---

## Operating Boundaries

- **Read-only** on source material: never modify files in `../src/content/blog/`
- **Read** the post index at `data/posts.jsonl` for metadata context
- Output goes to `data/story-beats.jsonl` and `reports/story-beats.csv`
- Scripts go in `scripts/`
- Every beat must reference its source `post_id`
- Beat IDs must be stable and deterministic

---

## What Makes a Story Beat

A story beat is a **self-contained narrative unit** with emotional or instructional weight. It has:

- A **setup** — context the reader needs
- A **conflict or tension** — what was at stake
- A **turn** — what changed (action, realization, event)
- An **outcome** — what resulted
- A **lesson** (optional) — what it means for the reader

Not every paragraph is a story beat. Look for moments of transformation, decision, surprise, humor, pain, or victory. Skip routine updates and logistical content unless they contain a narrative kernel.

---

## Story Beat Types

| Type | Description | Example |
|------|-------------|---------|
| `transformation` | A moment of real change | Reversing diabetes diagnosis |
| `struggle` | Honest account of difficulty | Fighting food addiction at a buffet |
| `victory` | Achievement against odds | First 5K run, 100lb milestone |
| `humor` | Self-deprecating or situational comedy | The scale anecdote |
| `wisdom` | Hard-won insight | "I can't until I can" moment |
| `relapse` | Setback honestly told | Regaining weight, restarting |
| `relationship` | Connection with others | Training with wife, grandfather's influence |
| `identity` | Shift in self-concept | "Former diabetic" declaration |

---

## Record Schema

```json
{
  "beat_id": "2012-09-01-50lbs-less-of-lee--beat-01",
  "post_id": "2012-09-01-50lbs-less-of-lee",
  "type": "victory",
  "setup": "Brief context of what preceded the moment",
  "conflict": "What was at stake or difficult",
  "turn": "The pivotal action or realization",
  "outcome": "What resulted from the turn",
  "lesson": "The takeaway (if explicit in the text)",
  "themes": ["weight-loss", "milestone", "discipline"],
  "emotional_tone": "triumphant",
  "book_relevance": "high",
  "source_excerpt": "A short direct quote anchoring this beat (under 40 words)"
}
```

---

## Expected Process

1. Read `data/posts.jsonl` for the post inventory
2. Prioritize posts by title signals (milestones, transformations, named concepts)
3. For each post, read the full Markdown content
4. Identify story beats using the type taxonomy above
5. For each beat, fill all schema fields
6. Write `data/story-beats.jsonl` sorted by post date then beat sequence
7. Write `reports/story-beats.csv`
8. Validate: all `post_id` values exist in posts.jsonl, no empty required fields

---

## Success Criteria

- Every extracted beat has a valid `post_id` linking to `data/posts.jsonl`
- Beat IDs are deterministic (re-running on same input produces same IDs)
- `source_excerpt` is a real quote from the post (verifiable)
- No beat has empty `setup`, `turn`, or `outcome`
- Type values come from the defined taxonomy
- Themes use the controlled vocabulary from `data/tags.json`

---

## Context Files To Read

1. `skills/mining-loop.md`
2. `project-definition.md` — story beat layer definition
3. `data/posts.jsonl` — post inventory for reference
4. `data/tags.json` — controlled vocabulary (when available)
5. `sprint-plan.md` — current sprint scope
