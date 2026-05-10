# Skill: Extraction Loop

> Load this skill when building or updating any data extraction script.

---

## The Loop

Every extraction task follows this sequence. **Do not skip or reorder steps.**

```
1. SCHEMA       → Define the output record shape before writing any code
2. CODE         → Write the extraction script
3. RUN          → Execute against the full source set
4. VALIDATE     → Check structural integrity of output (see skills/data-validation.md)
5. SPOT-CHECK   → Read 10+ source posts and compare to extracted records
6. FIX          → Repair everything that failed
7. LOOP         → Repeat 3–6 until output is clean
8. DOCUMENT     → Update project docs (see skills/documentation.md)
```

---

## How to Write Extraction Code Well

**Start with the output schema, not the parsing logic.**
Before writing any parsing code, define exactly what one output record looks like. Write a sample record by hand. Then build the code to produce that shape.

**Process one file first.**
Get a single post correctly extracted and printed to stdout. Verify every field by eye. Then wrap it in a loop.

**Handle malformed input gracefully.**
Blog posts are messy. Some may have broken frontmatter, missing dates, unusual encoding, or empty bodies. The script should log warnings and continue, not crash.

**Make output deterministic.**
Same input must produce same output. No timestamps, no random IDs, no insertion-order dependencies. Sort output by a stable key (date + slug).

**Preserve source links.**
Every record must include a `file_path` back to the original Markdown file. This is non-negotiable — the data is useless without provenance.

---

## How to Run

```bash
# From the lessOfLeeDataMining directory
node scripts/build-post-index.js

# Verify output
wc -l data/posts.jsonl          # Should match file count
head -1 data/posts.jsonl | jq . # Should be valid JSON
```

---

## What Validate Means

After the script runs, check:

1. **Record count** — matches the number of source files
2. **Field completeness** — no null values in required fields
3. **JSON validity** — every line parses as valid JSON
4. **ID uniqueness** — no duplicate IDs
5. **Referential integrity** — all file_path values point to real files
6. **Determinism** — running twice produces identical output

---

## When to Stop and Ask

Don't guess when you're stuck. Ask when:
- The frontmatter format is inconsistent across posts and you're unsure how to normalize
- A design decision about the record schema has consequences for downstream layers
- More than 5% of posts produce warnings or incomplete records
- You'd need to add an external dependency to handle a parsing edge case
