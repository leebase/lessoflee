# Skill: Data Validation

> Load this skill after any extraction or mining pass to verify output quality.

---

## Why Validation Matters

Bad data is worse than no data. A post index with wrong dates, a story beat with a fabricated quote, or a concept card referencing a non-existent post — these actively mislead the book-writing process. Validate before declaring success.

---

## Validation Tiers

### Tier 1: Structural (Automated)

These can and should be scripted. Run them every time.

| Check | How | Pass condition |
|-------|-----|----------------|
| JSON validity | Parse every line of JSONL | Zero parse errors |
| Field completeness | Check required fields for null/empty | Zero nulls in required fields |
| ID uniqueness | Collect all IDs, check for duplicates | Zero duplicates |
| Record count | Count lines, compare to source file count | Match (for post index) |
| Type constraints | Check enum fields against allowed values | All values in allowed set |

```bash
# Example validation commands
node scripts/validate-posts.js
# or inline:
cat data/posts.jsonl | jq -c '.id' | sort | uniq -d  # Should produce no output
```

### Tier 2: Referential (Automated)

Cross-reference between data layers.

| Check | How | Pass condition |
|-------|-----|----------------|
| File paths exist | Stat each `file_path` value | All resolve to real files |
| Post ID references | Look up each `post_id` in posts.jsonl | All found |
| Beat ID references | Look up each `beat_id` reference | All found |
| Tag vocabulary | Check themes/tags against `data/tags.json` | All from controlled set |

### Tier 3: Content (Manual spot-check)

Read source posts and compare to extracted records. This cannot be fully automated.

**Protocol:**
1. Pick 10 records at random (not the first 10 — random)
2. For each record, open the source post at `file_path`
3. Verify:
   - Title matches
   - Date matches
   - Word count is plausible (±10%)
   - Summary reflects actual content
   - Source excerpts (if present) appear verbatim in the post
4. Log any discrepancies

**Acceptable error rate:** Under 5% of spot-checked records have issues. Above 5% means the extraction has a systemic problem.

### Tier 4: Usefulness (Judgment)

Ask: would this data help Lee write a book?

- Are summaries informative or generic?
- Are story beats actually self-contained and compelling?
- Are concepts distinct and well-evidenced?
- Could you hand this data to a book editor and have them understand the archive?

---

## What to Do When Validation Fails

| Tier | Action |
|------|--------|
| Tier 1 failure | Fix the script. Do not proceed until structural checks pass. |
| Tier 2 failure | Fix the references. Usually a script bug or ID mismatch. |
| Tier 3 failure (under 5%) | Fix individual records. Acceptable noise. |
| Tier 3 failure (over 5%) | Re-examine the extraction logic. Systemic problem. |
| Tier 4 failure | Discuss with Lee. The approach may need rethinking. |

---

## Recording Validation Results

After validation, update `result-review.md` with:
- Which tiers were run
- Pass/fail status per tier
- Error count and type
- Any records that required correction
