# Book Mining Use Cases

This file describes how the Less of Lee blog archive should help Lee write books. The data mining system exists to make the archive usable as a source library, not just searchable as old posts.

## Primary User

Lee is the primary user. He needs to quickly find stories, claims, lessons, quotes, and patterns that can become chapters, scenes, essays, talks, or book proposals.

## Use Cases

### 1. Separate the two major health journeys

Lee has two related but distinct source arcs: the original Less of Lee weight-loss journey and the later Reversing Type 2 Diabetes journey.

The system should surface:

- posts from the original 2012-2013 weight-loss arc
- posts from the 2021-present Type 2 diabetes reversal arc
- date ranges and opening/later posts for each journey
- tags that let later reports and agents stay inside one arc when needed

Useful outputs:

- dashboard Health Journey Split
- controlled tags `original-less-of-lee-journey` and `reversing-type-2-diabetes-journey`
- post index with controlled tags

### 2. Find the strongest transformation arc

Lee wants to reconstruct the big story from obesity and Type 2 diabetes through remission, relapse, rebuilding, and renewed discipline.

The system should surface:

- milestone posts
- lab result posts
- before/after identity shifts
- setback and restart posts
- dated events that belong on a memoir timeline

Useful outputs:

- post index sorted by date
- dashboard sections for diabetes, relapse, restart, and milestones
- concept candidates such as `former diabetic`, `health is the destination`, and `start where you are`

### 3. Find diabetes reversal evidence

Lee wants source-backed material for a practical or memoir-driven book about Type 2 diabetes reversal.

The system should surface:

- A1c posts
- medication posts
- doctor/lab posts
- CGM and glucose posts
- insulin resistance posts
- posts contrasting disease identity with consequence/agency

Useful outputs:

- controlled tags for `diabetes`, `a1c`, `medication`, `doctor visit`, `lab results`, `insulin resistance`
- story candidates with evidence excerpts
- dashboard answer to "Where are my best diabetes reversal stories?"

### 4. Find fasting stories and lessons

Lee wants to locate fasting material by experience type: first attempts, extended fasts, safety concerns, lab evidence, pain relief, discipline, and breaking the fast.

The system should surface:

- fasting day posts
- fast conclusion posts
- fasting problem-solving posts
- feast/refeed posts
- posts about safety, labs, inflammation, and arthritis relief

Useful outputs:

- tags for `fasting`, `extended fasting`, `feasting`, `carnivore`, `pain`, `lab results`
- story candidates for struggle, wisdom, relapse, and victory

### 5. Find "I can't until I can" capability stories

Lee wants repeatable examples of becoming able to do things that once seemed impossible.

The system should surface:

- posts with "I can't", "until I can", "couldn't until I could"
- running, walking, shoveling snow, mowing, lifting, boxing, pickleball, off-roading, and VR fitness posts
- posts with before/after capability shifts

Useful outputs:

- concept card candidate for `i-cant-until-i-can`
- tags for `mobility`, `exercise`, `strength training`, `walking`, `running`, `identity`
- story candidates typed as `victory`, `transformation`, and `identity`

### 6. Find relapse, restart, and comeback material

Lee wants honest material that prevents the book from becoming fake victory-lap writing.

The system should surface:

- posts about regaining weight
- posts about losing discipline
- posts about restarting badly, stopping, and restarting again
- posts about "fall down 7, get up 8"
- posts about food addiction, moderation failure, and carb sensitivity

Useful outputs:

- tags for `relapse`, `restart`, `discipline`, `food addiction`, `carb sensitivity`
- dashboard answer to "Where are restart/failure/comeback stories?"

### 7. Find family and responsibility stories

Lee wants stories where the stakes are not just personal health, but being a husband, father, grandfather, and useful person.

The system should surface:

- Pawpaw posts
- marriage posts
- daughter/family event posts
- posts about carrying the load
- posts where love, duty, and responsibility are explicit motivators

Useful outputs:

- tags for `family`, `grandfather`, `marriage`, `identity`
- story candidates typed as `relationship` and `identity`

### 8. Find practical chapter material

Lee wants practical book sections that teach what worked.

The system should surface:

- keto, carnivore, low-carb, cooking, recipe, and meal posts
- exercise planning posts
- fasting protocol posts
- posts about systems, goals, discipline, and tracking

Useful outputs:

- tags for `keto`, `carnivore`, `recipes`, `exercise`, `fasting`, `discipline`
- post index with summaries and source tags

### 9. Find mantras, quotes, and Lee-isms

Lee wants reusable lines for chapter titles, pull quotes, social posts, talks, and section openings.

The system should surface:

- explicit mantras
- recurring refrains like "start where you are, make progress"
- recurring push phrases like "a little more", "a bit farther", and "always"
- repeated phrases
- strong post titles
- short excerpt anchors from story candidates
- concepts with representative quotes

Useful outputs:

- controlled tag for `mantras`
- concept candidates report
- story candidates report
- dashboard section for recurring ideas

### 10. Build candidate book structures

Lee wants to see possible books hiding inside the archive.

The system should support book tracks such as:

- memoir of health transformation
- practical Type 2 diabetes reversal book
- mindset and identity book
- fasting and feasting book
- faith, family, responsibility, and health reflections

Useful outputs:

- book-use labels on posts and story candidates
- dashboard grouped by use case
- concept candidates mapped to chapter ideas

### 11. Verify source truth while writing

Lee needs to avoid misremembering his own story.

The system should always provide:

- source file paths
- WordPress URLs when present
- dates
- direct excerpts that can be checked in the source post
- validation notes and caveats

## MVP Success

The first MVP is useful if Lee can open `reports/book-mining-dashboard.md` and immediately find:

- diabetes reversal stories
- separate entry points for the original Less of Lee journey and the Type 2 diabetes reversal journey
- fasting stories
- restart/failure/comeback stories
- family/responsibility stories
- recurring concepts that look like chapter ideas
- mantra/refrain posts Lee can reuse as chapter titles or reader-facing language
- exact source files to read next
