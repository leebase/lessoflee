# Skill: Data Review

> Load this skill before closing a sprint or when asked to review extraction quality.

---

## Review-Only Rules

**You are in analysis mode. Do not modify data files, scripts, or project documentation as part of the review.**

Your job is to find problems and describe fixes. Output goes to `code-reviews/review-<SCOPE>.md` where `<SCOPE>` is the review trigger (e.g., `sprint-1-post-index`, `story-beats-pass-1`).

---

## Phase 0: Scope the Review

Determine what you're reviewing:

| Trigger | Scope |
|---------|-------|
| Sprint close | All data produced in the sprint |
| Extraction pass | Output of a specific script run |
| Full data review | All data layers |
| Specific layer | Named data file only |

Write down which files are in scope.

---

## Phase 1: Run Structural Checks

Run every validation the project provides:

```bash
# Check JSONL validity
cat data/posts.jsonl | jq -c . > /dev/null

# Check record counts
wc -l data/posts.jsonl
ls ../src/content/blog/*.md | wc -l

# Check for duplicate IDs
cat data/posts.jsonl | jq -r '.id' | sort | uniq -d

# Check for null required fields
cat data/posts.jsonl | jq -c 'select(.title == null or .date == null or .id == null)'
```

If any check fails, **that is Finding #1**.

---

## Phase 2: Review Lenses

### A. Structural Integrity
- Valid JSONL/JSON/CSV?
- All required fields present?
- IDs unique and stable?
- Record count correct?
- Pipeline deterministic? (run twice, compare hashes)

### B. Referential Integrity
- All `post_id` references resolve?
- All `file_path` values point to real files?
- All themes from controlled vocabulary?

### C. Content Accuracy (Spot-Check)
- Pick 10 random records
- Open source post, compare to record
- Verify word counts, dates, summaries, quotes
- Check HTML entities are decoded in excerpts and titles

### D. Precision & False Positives
- Are tag/concept frequencies plausible? (>40% of posts matching a single concept is suspicious)
- Do short keyword aliases (≤5 chars like "fast", "walk", "i can") produce false positives?
- Is story type classification balanced? (One type at 70%+ = broken classifier)
- Verify 5 concept supporting_posts: are the matched_aliases actually relevant?

### E. Completeness
- Any source files missing from output?
- Any obvious story beats missed?
- Any clear concepts not captured?
- Are minimal-content posts (video, image-only) handled?

### F. Book-Mining Usefulness
- Would an author find these records helpful?
- Are story beats self-contained narrative units?
- Could you build a chapter outline from this data?
- Are dashboard answers practical (sort order, item count, link quality)?

---

## Phase 3: Write the Review

Output to `code-reviews/review-<SCOPE>.md`:

```markdown
# Data Review — <SCOPE>

**Date**: YYYY-MM-DD
**Reviewer**: AI (skill: data-review)
**Scope**: [what was reviewed]

## Validation Results
| Check | Result |
|-------|--------|
| JSONL validity | Pass/Fail |
| Record count | N records vs N expected |
| ID uniqueness | Pass/Fail |
| Field completeness | Pass/Fail (N nulls found) |
| Referential integrity | Pass/Fail |

## Spot-Check Results
| Record ID | Source Post | Accurate? | Notes |
|-----------|------------|-----------|-------|
| ... | ... | Yes/No | ... |

## Findings

| ID | Severity | Category | Location | Problem | Proposed Fix |
|----|----------|----------|----------|---------|--------------|
| R001 | ... | ... | ... | ... | ... |

## Remediation
### Fix Now
- [blockers]

### Fix Soon
- [high ROI]

### Fix Later
- [nice to have]
```

---

## Severity Guide

| Level | Meaning |
|-------|---------|
| **Critical** | Data corruption, wrong records, fabricated content |
| **High** | Missing data, broken references, systematic inaccuracy |
| **Med** | Incomplete records, inconsistent formatting |
| **Low** | Minor quality issues, style inconsistencies |
