# Agents Folder

`agents/` contains optional role briefs for coding harnesses that support delegation, sub-agents, or task-specialized workers.

## How To Use This Folder

- Treat each file in `agents/` as a portable markdown prompt, not as required runtime configuration.
- If your harness supports sub-agents, load the relevant file as that agent's role or system prompt.
- If your harness does not support sub-agents, the main agent should read the file and follow it directly.
- `AGENTS.md` remains the source of truth for startup protocol and guardrails.
- `skills/` remains the source of truth for reusable task workflows.

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `post-indexer.md` | Parse and catalog blog posts into structured records | Sprint 1: building the canonical post index |
| `story-miner.md` | Extract narrative beats and story units from posts | Sprint 3+: mining posts for book material |
| `concept-extractor.md` | Identify and catalog recurring themes and principles | Sprint 3+: building concept cards |
| `data-reviewer.md` | Validate data quality and consistency | Any time extraction output needs review |

## Authoring Rules

- Keep role briefs plain markdown and relative-path based.
- Avoid harness-specific tool names, model names, or required frontmatter.
- Reference `skills/*.md` and root project docs instead of duplicating them.
- Describe responsibilities, boundaries, inputs, outputs, and success criteria.
- Make the role useful even when copied into another harness verbatim.
