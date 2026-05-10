# Skill: Documentation Update

> Load this skill after validation passes, before committing.

---

## Why This Matters

Documentation is not clerical work. It is the **handoff note** that lets the next session — any LLM, any human — pick up where you left off without confusion. A good session with bad documentation is a net negative: you built something that will be misunderstood or duplicated.

---

## What to Update and When

| File | Update when... | What to write |
|------|----------------|---------------|
| `context.md` | Every session end | Current state, next actions queue, decisions locked |
| `result-review.md` | You completed something meaningful | What was built, why it matters, how to verify it |
| `sprint-plan.md` | Tasks complete or status changes | Mark tasks done, update notes |
| `project-definition.md` | Data layer design evolves | Schema changes, new layers |

**If in doubt, update.** Over-documentation is recoverable. Under-documentation causes the next agent to re-discover your work the hard way.

---

## How to Write a Good `context.md` Update

A bad `context.md` looks like:
```
## What's Happening Now
Working on the project. Some things done.
```

A good `context.md` looks like:
```
## What's Happening Now

### Current Focus
Building the canonical post index from 589 blog posts.

### Recently Completed
- Built scripts/build-post-index.js
- Generated data/posts.jsonl (589 records)
- Validated: 589/589 records pass structural checks, 10/10 spot-checks pass

### Decisions Locked
| Decision | Rationale | Date |
|---|---|---|
| Slug-based IDs | Stable across re-runs, human-readable | 2026-05-09 |

### Next Actions Queue
1. [IMPLEMENT] Build controlled vocabulary from post content
2. [TAG] Apply initial tags to all posts
3. [VALIDATE] Verify tag coverage and accuracy
```

The test: could an agent with no prior context read this and know exactly what to do next?

---

## How to Write a Good `result-review.md` Entry

Add new entries at the **top** of the file. Use this structure:

```markdown
## [DATE] — [Short description of what was built]

### What Was Built
[1–3 sentences. What exists now that didn't before.]

### Why It Matters
[1–2 sentences. What problem does this solve or what does it enable?]

### How to Verify
[Step-by-step commands or actions to confirm it works. Be specific enough
that someone who didn't build it can verify it.]
```

---

## The Commit Is Part of Documentation

When committing is in scope, the commit message is documentation.

```bash
git commit -m "feat: build canonical post index from 589 blog posts"
```

Commit message types:
- `feat:` — new data layer or extraction capability
- `fix:` — correction to extraction logic or data
- `docs:` — documentation only
- `refactor:` — restructure without output change
- `data:` — data file updates from re-extraction
