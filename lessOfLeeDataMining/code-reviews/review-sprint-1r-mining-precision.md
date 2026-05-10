# Code Review — Sprint 1R Mining Precision

**Date**: 2026-05-10  
**Reviewer**: Codex  
**Scope**: `828d766 fix: improve mining precision`  
**Primary file reviewed**: `lessOfLeeDataMining/scripts/build-mining-mvp.js`

---

## Remediation Status

**Status**: Remediated in the follow-up pass after this review.

- R001 fixed by adding full story tag membership as `all_themes`, using it for dashboard scoring, and preserving journey tags in display `themes`.
- R002 fixed by reporting journey questions as story candidates across total tagged posts.
- R003 fixed by clarifying that determinism is a release check, not an in-pipeline validation check.
- R004 fixed by removing unused concept-evidence variables.

---

## Findings

| ID | Severity | Location | Finding | Recommendation |
|----|----------|----------|---------|----------------|
| R001 | High | `scripts/build-mining-mvp.js:886`, `scripts/build-mining-mvp.js:1263` | Journey-required dashboard questions filter against `story.themes`, but `themes` is only the first six alphabetically sorted tags. Because the new journey tags sort after many topic tags, valid story candidates often lose their journey tag before dashboard scoring. In generated data, 67 of 174 diabetes-journey story candidates and 3 of 6 original-journey story candidates have the correct journey tag in `post-tags.jsonl` but not in `story.themes`. This excludes important posts from journey-filtered dashboard questions. Example: `2021-07-31-off-all-diabetes-meds-8211-3-month-update` has `reversing-type-2-diabetes-journey` in `post-tags.jsonl`, but its story themes are only `a1c-labs, capability-recovery, exercise, fasting, feasting, health-identity`. | Keep full tag membership available for scoring. Options: add `all_themes` to story candidates, make `scoreForQuestion` use a `tagsByPost` lookup instead of truncated `themes`, or ensure journey tags are always included before slicing display themes. |
| R002 | Medium | `scripts/build-mining-mvp.js:1431` | `reports/validation.md` counts Lee-question coverage using the same `scoreForQuestion(story, item)` path, so it inherits R001 and underreports journey coverage. The report says the original Less of Lee journey has only 3 candidates even though the Health Journey Split correctly shows 49 tagged posts. | After fixing R001, update validation to distinguish journey archive coverage from story-candidate coverage. For journey questions, report both tagged posts and story candidates. |
| R003 | Low | `architecture.md:119` and `scripts/build-mining-mvp.js:1335` | Architecture says validation checks deterministic output across consecutive runs, but the pipeline validation function does not perform a determinism check. Determinism was tested manually during delivery, but the generated `reports/validation.md` cannot prove it by itself. | Either add an in-script deterministic self-check mode, or revise architecture/validation wording so determinism is documented as an external release check rather than a built-in pipeline check. |
| R004 | Low | `scripts/build-mining-mvp.js:1023` | `bodyAmbiguousAliases` and `relatedStrongTags` are calculated but no longer used in `evidenceStrength`. This is not breaking output, but it makes the concept evidence logic harder to trust because it looks like related strong tags still influence weak/strong classification. | Remove the unused variables or restore an intentional related-tag rule with clear thresholds. |

---

## Checks Run

```bash
git show --stat --oneline HEAD
git diff HEAD^ HEAD -- lessOfLeeDataMining/scripts/build-mining-mvp.js
node -e '<count story candidates with journey tag missing from story.themes>'
node -e '<inspect specific story themes for key diabetes posts>'
```

Key observed counts:

- Diabetes journey story candidates: 174 total, 67 missing `reversing-type-2-diabetes-journey` from `story.themes`.
- Original journey story candidates: 6 total, 3 missing `original-less-of-lee-journey` from `story.themes`.
- Example excluded from journey-filtered dashboard scoring: `Off All Diabetes Meds – 3 Month Update`.

---

## Summary

The precision remediation substantially improves the MVP: boundary-aware matching, journey partitioning, stronger concept evidence separation, and better reports are all good moves. The main remaining issue is the interaction between truncated display themes and dashboard scoring. Fixing that should be the next small pass before relying on the journey-filtered dashboard answers.
