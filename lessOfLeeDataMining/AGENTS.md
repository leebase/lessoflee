# Agent Guide: lessOfLeeDataMining

> **For AI agents working on the Less of Lee data mining project.**
>
> This project uses **AgentFlow** — a documentation-driven methodology for human-AI collaboration.
> Read this file first, then `context.md` for current state.

---

## Why This System Exists

AI agents are stateless. Every new session starts from zero. These project files act as **shared memory** between you, the human, and any other AI that works on this project.

When you update `context.md` at session end, you're writing a handoff note that lets **any LLM** — Claude, ChatGPT, Gemini, Copilot — pick up exactly where you left off. Treat these updates as critical, not clerical.

---

## Project Purpose

Mine the Less of Lee WordPress archive (589 blog posts, 2012–present) for reusable book material: stories, scenes, themes, concepts, turning points, evidence, quotes, and chapter candidates.

The source material lives at `../src/content/blog/*.md`. These are the canonical raw source. Do not modify them.

---

## Startup Protocol

At the start of every session, in order:

1. Read `AGENTS.md` (this file) — guardrails and operating rules
2. Read `context.md` — current state and what to do next
3. Read `result-review.md` — what was recently completed
4. Read `sprint-plan.md` — current sprint tasks and priorities
5. Read `project-definition.md` — data layers and architecture

If your harness supports delegated or sub-agents, also read `agents/README.md` before selecting a role brief from `agents/`.

---

## Available Skills

Load the relevant skill file when the trigger applies. Do not try to remember — read the file.

| Trigger | Skill to Load |
|---------|--------------|
| You are building or updating a data extraction script | `skills/extraction-loop.md` |
| You are mining posts for story beats or concepts | `skills/mining-loop.md` |
| You are validating extracted data quality | `skills/data-validation.md` |
| You are about to commit | `skills/documentation.md` |
| You are creating a backlog item | `skills/backlog.md` |
| You are reviewing data quality or sprint output | `skills/data-review.md` |

Skills are short, focused, and task-specific. They contain the judgment, not just the steps.

---

## Harness Compatibility

To keep this project usable across Codex, Claude, Gemini, Copilot, Aider, and similar coding harnesses, treat the project docs as portable instructions rather than runtime-specific config.

- `AGENTS.md` is the source of truth for startup protocol, guardrails, and collaboration expectations.
- `skills/*.md` are portable markdown playbooks. Any harness may load and follow them when their trigger applies.
- `agents/*.md` are optional role briefs for harnesses that support delegated agents or task-specialized sub-agents.
- If a harness does not support explicit sub-agents, the main agent should read the relevant file in `agents/` and apply it directly.
- Keep these files plain markdown and relative-path based.

---

## Task Rehydration

**Before continuing any task mid-session:**

1. Re-read `sprint-plan.md`
2. Re-read any files you modified previously in this session
3. Confirm the objective — proceed only when you are oriented

Agents drift. This rule prevents it.

---

## Autonomy Modes

The `Mode` field in `context.md` controls how independently you work:

| Mode | Name | Behavior |
|------|------|----------|
| **1** | Supervised | Ask before every significant action. Explain plan, wait for approval. |
| **2** | Collaborative | Plan approach, implement with check-ins. Ask for approval on decisions, not on routine extraction. |
| **3** | Autonomous | Execute independently within guardrails. Report results. Only ask if blocked or decision has major consequences. |

**Default is Mode 2.** The human may change the mode in `context.md` at any time.

---

## Guardrails

### Allowed

- Write and run extraction/mining scripts in `scripts/`
- Create and update data files in `data/`
- Generate reports in `reports/`
- Create and update documentation
- Update context and decision logs
- Create backlog items in `backlog/candidates/`

### Not Allowed (Without Explicit Permission)

- Modify source blog posts in `../src/content/blog/`
- Add external runtime dependencies without approval
- Delete data files without confirming necessity
- Skip validation or documentation updates
- Commit directly to protected branches
- Move files out of `backlog/candidates/` (human curates)
- Use paid API calls (embeddings, LLM inference) without approval

---

## Data Integrity Rules

- Every extracted record must trace back to a source file path
- IDs must be stable across re-runs (slug-based, not sequential)
- JSONL for machine processing, CSV/Markdown for human review
- Never overwrite data without explicit versioning or backup
- Validate output structure before declaring success

---

## Document Reference

| File | When to Read | When to Update |
|------|--------------|----------------|
| `AGENTS.md` | Every session start | When conventions change |
| `context.md` | Every session start | Every session end |
| `result-review.md` | Every session start | When work completed |
| `sprint-plan.md` | Every session start | When tasks complete |
| `project-definition.md` | When scope unclear | When data layers evolve |
| `agents/README.md` | Before using delegated agents | When the delegated-agent workflow changes |
| `agents/*.md` | Before delegating to a specialized role | When the role instructions change |

---

## Communication Style

- **Concise**: Get to the point quickly
- **Specific**: Include file paths, record counts, exact commands
- **Actionable**: Provide clear next steps
- **Honest**: Flag concerns or blockers immediately
