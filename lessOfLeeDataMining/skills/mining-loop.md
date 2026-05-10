# Skill: Mining Loop

> Load this skill when mining posts for story beats, concepts, or other interpretive content.

---

## The Difference Between Extraction and Mining

**Extraction** is mechanical: parse structured data from a known format. The answer is in the file.

**Mining** is interpretive: read prose and identify narrative patterns, themes, and meaning. The answer requires judgment.

Mining produces opinions, not facts. That's fine — but it means the quality bar is different. Every mined record must be **evidenced** (traceable to source text) and **useful** (would help an author write a book).

---

## The Loop

```
1. SCOPE        → Decide which posts to mine this pass (not all 589 at once)
2. READ         → Read the full content of each scoped post carefully
3. IDENTIFY     → Find story beats, concepts, or themes in the text
4. EVIDENCE     → For each finding, anchor it to a specific source excerpt
5. STRUCTURE    → Fill the record schema completely
6. VALIDATE     → Check referential integrity and field completeness
7. REVIEW       → Re-read your output critically: is this actually useful?
8. FIX          → Repair anything that fails the review
9. DOCUMENT     → Update project docs
```

---

## How to Scope a Mining Pass

Do not attempt to mine all 589 posts in one session. Scope by:

- **Title signals**: Posts with titles suggesting milestones, transformations, or concepts (e.g., "50lbs Less of Lee", "I Can't Until I Can")
- **Story value**: Posts flagged as high story_value in the post index
- **Date clusters**: Major transformation periods (first 6 months, diabetes reversal period)
- **Theme**: All posts about a single topic (fasting, relapse, identity)

A good mining pass covers 10–30 posts deeply, not 100 posts shallowly.

---

## How to Mine Well

**Read the whole post first.** Don't extract while scanning. Read it like a reader, then re-read it like an editor looking for moments.

**Anchor to text.** Every finding needs a `source_excerpt` — a short direct quote (under 40 words) that proves the beat or concept exists in the source. If you can't quote it, you're inventing it.

**Prefer specific over general.** "Lee struggled with food" is not a story beat. "Lee describes standing at a buffet, knowing exactly which choices would destroy his progress, and choosing differently for the first time" — that's a beat.

**Respect the author's voice.** Lee's writing style is direct, self-deprecating, and practical. Extracted summaries should reflect that tone, not academic language.

**Not everything is a beat.** Many posts are routine updates, logistics, or recipes. It's correct to read a post and find zero story beats. Don't force it.

---

## Quality Gut-Check

Before writing a record, ask:

> If Lee were assembling a book chapter and saw this record in a search result, would he say "yes, that's the moment I need" or "what is this?"

If the latter, don't write the record.

---

## When to Stop and Ask

- You're unsure whether something is a genuine recurring concept vs. a one-time phrase
- A post contains sensitive personal content and you're unsure how to represent it
- The controlled vocabulary doesn't have a tag that fits and you'd need to add one
- You've mined 30+ posts and want feedback on quality before continuing
