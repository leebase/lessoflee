# Skill: Backlog Management

> Load this skill when creating, reviewing, or triaging backlog items.

---

## The Backlog System

The `backlog/` folder is a **state machine**: items move through stages as they progress from idea to shipped.

```
backlog/
  candidates/    ← AI writes here. Human reviews.
  approved/      ← Human moves items here. AI implements.
  parked/        ← Human moves items here. Deferred indefinitely.
  implemented/   ← Builder moves items here on completion.
```

**The rule:** Only the human moves items between folders (except the last step — builder moves to `implemented/` when done). This preserves human judgment over what gets worked on.

---

## How to Create a Backlog Item

Create a new file at `backlog/candidates/BI-NNN-kebab-title.md` with this structure:

```markdown
# BI-NNN: Title

## What
[What to build or extract — specific and concrete]

## Why
[Why this is valuable for the book-mining goal — not just "it would be nice"]

## Acceptance Criteria
- [ ] [Specific, verifiable criterion]
- [ ] [Another criterion]
- [ ] [Each one should be pass/fail testable]

## Scope
[What is included and what is explicitly excluded]

## Dependencies
[What must exist first — which data layers, which sprints]

## Estimated Effort
[S/M/L — Small is one session, Medium is 2-3 sessions, Large is a full sprint]
```

---

## What Makes a Good Backlog Item

### The acceptance criteria test

**Bad (vague):**
```
- Posts are tagged
- Data is better
```

**Good (specific and verifiable):**
```
- Every post in data/posts.jsonl has a `primary_theme` field from data/tags.json
- At least 90% of posts have 2+ `secondary_themes`
- Running scripts/validate-tags.js produces zero errors
```

### The scope test

A backlog item should be implementable in one focused sprint without scope creep. If you find yourself writing "and also..." more than once, split it.

### The context test

The item should explain:
1. **What** to build
2. **Why** it's valuable for book mining
3. **How** to verify it's done

---

## When to Create a Backlog Item vs. Just Do It

**Just do it** if:
- The work is clearly within the current sprint's scope
- It's a fix discovered while validating extraction output
- It takes less than 30 minutes and is obviously right

**Create a backlog item** if:
- It's a new data layer or extraction capability
- You're unsure if it's the right direction
- It requires Lee's input on what's valuable
- It would change the schema of an existing data layer
