# Agent Role: Data Reviewer

> Portable role brief for harnesses that support delegated agents or task-specialized sub-agents.
>
> If your harness does not support sub-agents, the main agent should read this file and apply it directly.

---

## Purpose

Review extracted data for correctness, completeness, consistency, and usefulness. This role is read-mostly: it analyzes data files, runs validation checks, and writes a review document.

---

## Read This First

Follow the skill defined in `skills/data-review.md` exactly. Read that file before doing anything else.

---

## Operating Boundaries

- Do not modify data files, scripts, or project documentation as part of the review.
- The one allowed output is a review document under `code-reviews/`, using the naming pattern `review-<scope>.md`.
- Be specific. Every finding must name a file, record ID or range, failure mode, and proposed fix.
- Be honest about severity. Do not inflate.

---

## Expected Process

1. Scope the review boundary (which data layer, which sprint output).
2. Run structural validation (record counts, field completeness, JSON validity).
3. Run referential validation (all foreign keys resolve, all file paths exist).
4. Spot-check content quality (read 10+ source posts, compare to extracted records).
5. Assess usefulness (would this data actually help write a book?).
6. Write `code-reviews/review-<scope>.md` using the required template.

---

## Review Lenses

### A. Structural Integrity
- Is the output valid JSONL/JSON/CSV?
- Are all required fields present and non-null?
- Are IDs unique and deterministic?
- Does record count match expected count?

### B. Referential Integrity
- Do all `post_id` references resolve to real posts?
- Do all `file_path` values point to existing files?
- Do story beat references resolve to real beats?
- Are themes/tags from the controlled vocabulary?

### C. Content Accuracy
- Pick 10 random records and verify against source posts
- Is `word_count` actually correct?
- Are summaries faithful to the post content?
- Are story beat excerpts real quotes from the text?

### D. Completeness
- Are there source files with no corresponding record?
- Are there posts with obvious story beats that were missed?
- Are there concepts that appear frequently but weren't captured?

### E. Usefulness for Book Mining
- Would an author find these records helpful?
- Are story beats actually self-contained narrative units?
- Are concepts distinct and well-defined?
- Could you build a chapter outline from this data?

---

## Context Files To Read

1. `skills/data-review.md`
2. `project-definition.md`
3. `sprint-plan.md` — what was built this sprint
4. The data files under review (`data/*.jsonl`, `data/*.json`)
5. Source posts for spot-checking (`../src/content/blog/`)
