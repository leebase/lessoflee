#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectRoot, "..");
const sourceDir = path.join(repoRoot, "src", "content", "blog");
const dataDir = path.join(projectRoot, "data");
const reportsDir = path.join(projectRoot, "reports");

const EXPECTED_SOURCE_COUNT = 589;
const DASHBOARD_STORY_LIMIT = 15;
const DASHBOARD_CONCEPT_LIMIT = 12;
const DISTINCTIVE_SHORT_ALIASES = new Set(["a1c", "cgm", "crp", "nsv", "5k", "t2d", "bbbe", "hiit"]);
const AMBIGUOUS_ALIASES = new Set([
  "again",
  "abilities",
  "fast",
  "feast",
  "free",
  "hard",
  "i can",
  "lab",
  "how far",
  "how much farther",
  "how much more",
  "pain",
  "reclaim",
  "run",
  "walk",
  "weakness",
  "always",
  "a bit more",
  "bit more",
  "little more",
]);

const TAGS = [
  {
    id: "original-less-of-lee-journey",
    type: "partition",
    label: "Original Less of Lee Journey",
    description:
      "The original 2012-2013 Less of Lee weight-loss and fitness journey before the later Type 2 diabetes reversal arc.",
    aliases: [
      "less of lee",
      "weight loss",
      "obese",
      "obesity",
      "biggest loser",
      "couch potato",
      "onederland",
      "25lbs",
      "50lbs",
      "70lbs",
      "80lbs",
      "100lbs",
    ],
    book_uses: ["memoir_spine", "original_arc", "weight_loss_origin"],
  },
  {
    id: "reversing-type-2-diabetes-journey",
    type: "partition",
    label: "Reversing Type 2 Diabetes Journey",
    description:
      "The 2021-present arc of reversing Type 2 diabetes, leaving medication, maintaining remission, relapse, and renewed recovery.",
    aliases: [
      "reversing type 2 diabetes",
      "type 2 diabetes",
      "t2d",
      "diabetes",
      "diabetic",
      "a1c",
      "metformin",
      "glipizide",
      "trulicity",
      "insulin",
      "med free",
      "former diabetic",
      "diabetes free",
    ],
    book_uses: ["memoir_spine", "diabetes_reversal_arc", "medical_arc"],
  },
  {
    id: "type-2-diabetes",
    label: "Type 2 Diabetes",
    description:
      "Diagnosis, reversal/remission, labs, medication, glucose, and metabolic recovery.",
    aliases: [
      "type 2 diabetes",
      "t2d",
      "diabetes",
      "diabetic",
      "a1c",
      "blood sugar",
      "glucose",
      "insulin resistance",
      "metformin",
      "glipizide",
      "trulicity",
      "meds",
      "medication",
      "remission",
    ],
    book_uses: ["medical_arc", "evidence", "practical_health"],
  },
  {
    id: "a1c-labs",
    label: "A1c And Labs",
    description: "Posts with lab results, doctor feedback, A1c values, and measurable proof.",
    aliases: [
      "a1c",
      "lab",
      "labs",
      "blood work",
      "doctor",
      "cgm",
      "glucose",
      "insulin",
      "kidney",
      "lipid",
      "crp",
    ],
    book_uses: ["evidence_case", "proof_point", "chapter_support"],
  },
  {
    id: "fasting",
    label: "Fasting",
    description: "Fasting as metabolic tool, discipline practice, and healing accelerator.",
    aliases: [
      "fasting",
      "fast",
      "water fast",
      "extended fasting",
      "intermittent fasting",
      "5 day fast",
      "7 day fast",
      "14 day fast",
      "21 day fast",
      "hunger",
      "break the fast",
      "autophagy",
    ],
    book_uses: ["practical_protocol", "transformation_tool", "chapter_cluster"],
  },
  {
    id: "feasting",
    label: "Feasting",
    description:
      "The positive-food side of the program: satisfying meals without destructive patterns.",
    aliases: [
      "feast",
      "feasting",
      "keto",
      "low carb",
      "low-carb",
      "carnivore",
      "protein",
      "recipe",
      "bbbe",
      "thanksgiving",
    ],
    book_uses: ["practical_food", "mindset_reframe"],
  },
  {
    id: "capability-recovery",
    label: "Capability Recovery",
    description: "Regaining ordinary and extraordinary abilities through health recovery.",
    aliases: [
      "cane",
      "stairs",
      "walk",
      "walking",
      "run",
      "running",
      "carry",
      "winter",
      "arthritis",
      "osteoarthritis",
      "mobility",
      "pain",
      "5k",
    ],
    book_uses: ["story_finder", "memoir_arc", "proof_points"],
  },
  {
    id: "exercise",
    label: "Exercise",
    description: "Exercise as health signal, mental discipline, and capacity building.",
    aliases: [
      "exercise",
      "workout",
      "training",
      "push day",
      "saturday push day",
      "hiit",
      "supernatural",
      "strength training",
      "weights",
      "lifting",
      "muscle",
    ],
    book_uses: ["habit_system", "practical_health", "scene_finder"],
  },
  {
    id: "mindset",
    label: "Mindset",
    description: "The inner work required to keep going, restart, and choose health repeatedly.",
    aliases: [
      "mindset",
      "discipline",
      "willpower",
      "will power",
      "mental",
      "battle",
      "excuse",
      "choice",
      "hard",
      "systems",
    ],
    book_uses: ["throughline", "chapter_theme"],
  },
  {
    id: "failure-restart",
    label: "Failure And Restart",
    description: "Failure treated as process data rather than final defeat.",
    aliases: [
      "fail",
      "failure",
      "backslide",
      "restart",
      "starting again",
      "fall down",
      "get up",
      "rise again",
      "again",
      "regained",
      "old ways",
    ],
    book_uses: ["reader_encouragement", "chapter_theme", "honest_setback"],
  },
  {
    id: "health-identity",
    label: "Health Identity",
    description:
      "Posts where Lee names the person he is becoming, not merely the weight he is losing.",
    aliases: [
      "former diabetic",
      "ex-diabetic",
      "non diabetic",
      "diabetes free",
      "med free",
      "athlete",
      "new me",
      "no longer",
      "identity",
      "less unhealthy",
    ],
    book_uses: ["identity_arc", "memoir_arc"],
  },
  {
    id: "nsv",
    label: "Non-Scale Victory",
    description: "Concrete life improvements that prove health change beyond the scale.",
    aliases: [
      "nsv",
      "non-scale victory",
      "proof",
      "evidence",
      "victory",
      "triumph",
      "clothes",
      "ring",
      "shirt",
      "clown pants",
    ],
    book_uses: ["scene_finder", "proof_points"],
  },
  {
    id: "family-responsibility",
    label: "Family Responsibility",
    description:
      "Health as responsibility to people who need Lee present, capable, and durable.",
    aliases: [
      "family",
      "wife",
      "daughter",
      "daughters",
      "grandfather",
      "father",
      "husband",
      "pawpaw",
      "grandson",
      "loved and needed",
      "carry the load",
    ],
    book_uses: ["emotional_core", "memoir_arc"],
  },
  {
    id: "food-addiction",
    label: "Food Addiction And Boundaries",
    description:
      "Food temptation, carb sensitivity, processed food, holidays, and boundary setting.",
    aliases: [
      "food addiction",
      "carb sensitivity",
      "carbs",
      "sugar",
      "processed",
      "moderation",
      "doritos",
      "buffet",
      "holiday",
      "thanksgiving",
      "tempted",
    ],
    book_uses: ["temptation_scene", "harm_reduction", "practical_boundary"],
  },
  {
    id: "humor-voice",
    label: "Humor And Voice",
    description: "Lee-style humor, memorable titles, and humanizing self-description.",
    aliases: [
      "clown pants",
      "doritos",
      "scale",
      "liar",
      "stupid",
      "hippo",
      "body by",
      "funny",
      "smurfette",
    ],
    book_uses: ["quote_bank", "voice_bank", "humor_relief"],
  },
  {
    id: "mantras",
    label: "Mantras",
    description:
      "Repeated Lee phrases that function as compact operating principles, chapter titles, and reader-facing refrains.",
    aliases: [
      "mantra",
      "mantras",
      "start where you are",
      "make progress",
      "make improvements",
      "a little more",
      "little more",
      "how much more",
      "how far",
      "how much farther",
      "a bit farther",
      "bit farther",
      "a bit more",
      "bit more",
      "always a little more",
      "always",
      "i can't until i can",
      "i cant until i can",
    ],
    book_uses: ["chapter_title", "reader_refrain", "voice_bank", "quote_bank"],
  },
];

const CONCEPT_SEEDS = [
  {
    concept_id: "i-cant-until-i-can",
    name: "I Can't Until I Can",
    definition:
      "Perceived impossibility becomes ability through repeated attempts, adaptation, and time.",
    aliases: [
      "i can't until i can",
      "i cant until i can",
      "couldn't until i could",
      "couldnt until i could",
      "until i can",
      "i can",
    ],
    related_tags: ["capability-recovery", "exercise", "mindset", "nsv"],
    book_uses: ["chapter_title", "throughline", "scene_finder"],
    candidate_chapters: ["The Impossible Becomes Routine"],
  },
  {
    concept_id: "start-where-you-are",
    name: "Start Where You Are",
    definition: "The starting point is not disqualifying; it is the only honest place to begin.",
    aliases: [
      "start where you are",
      "we all start somewhere",
      "do what you can",
      "make improvements",
      "make progress",
      "a little more",
    ],
    related_tags: ["mantras", "mindset", "failure-restart", "exercise"],
    book_uses: ["reader_entry", "chapter_title", "practical_mindset"],
    candidate_chapters: ["Start Where You Are"],
  },
  {
    concept_id: "little-more-bit-farther-always",
    name: "A Little More, A Bit Farther, Always",
    definition:
      "Lee's progressive-overload mantra: begin where you are, then repeatedly push the boundary a little more and a bit farther.",
    aliases: [
      "a little more",
      "a bit farther",
      "always a little more",
      "a little more always",
      "a little more and a bit farther",
      "a little more a little harder and a little longer",
      "how much more",
      "little more",
      "how much farther",
      "how far",
      "bit farther",
      "a bit more",
      "bit more",
    ],
    related_tags: ["mantras", "mindset", "exercise", "capability-recovery"],
    book_uses: ["chapter_title", "reader_refrain", "training_principle", "quote_bank"],
    candidate_chapters: ["A Little More, A Bit Farther, Always"],
  },
  {
    concept_id: "fail-your-way-to-health",
    name: "Fail Your Way To Health",
    definition:
      "Failure is expected data, not final defeat; the durable skill is returning to the work.",
    aliases: [
      "fail your way to health",
      "fail and fail again",
      "fail in order to succeed",
      "fall down",
      "get up",
      "backslide",
      "starting again",
    ],
    related_tags: ["failure-restart", "mindset"],
    book_uses: ["chapter_title", "reader_encouragement", "recovery_framework"],
    candidate_chapters: ["Failure Is Not The Opposite Of Progress"],
  },
  {
    concept_id: "former-diabetic",
    name: "Former Diabetic",
    definition:
      "A health identity claim that rejects permanent sickness while respecting maintenance.",
    aliases: [
      "former diabetic",
      "ex-diabetic",
      "non diabetic",
      "diabetes free",
      "med free",
      "off all diabetes meds",
      "remission",
    ],
    related_tags: ["type-2-diabetes", "health-identity"],
    book_uses: ["identity_arc", "chapter_title", "medical_arc"],
    candidate_chapters: ["Former Diabetic"],
  },
  {
    concept_id: "health-is-the-destination",
    name: "Health Is The Destination",
    definition:
      "The real goal is health and ability, not a number on the scale or a temporary finish line.",
    aliases: [
      "health is the destination",
      "destination health",
      "all the way to health",
      "not just weight loss",
      "total health",
      "journey to health",
    ],
    related_tags: ["health-identity", "type-2-diabetes", "exercise"],
    book_uses: ["book_thesis", "chapter_title", "organizing_principle"],
    candidate_chapters: ["Health Is The Destination"],
  },
  {
    concept_id: "you-build-your-health",
    name: "You Build Your Health",
    definition:
      "Health is built by repeated behaviors; it cannot be purchased, delegated, or wished into being.",
    aliases: [
      "you build your health",
      "build your health",
      "building tomorrow",
      "daily work",
      "can't buy health",
      "take charge",
    ],
    related_tags: ["mindset", "exercise", "type-2-diabetes"],
    book_uses: ["practical_framework", "chapter_title"],
    candidate_chapters: ["You Build Your Health"],
  },
  {
    concept_id: "no-longer-fragile",
    name: "No Longer Fragile",
    definition:
      "The shift from avoiding life because the body is unreliable to trusting the body under stress.",
    aliases: [
      "no longer fragile",
      "no longer weak",
      "no longer sedentary",
      "winter shut",
      "stronger",
      "weakness",
    ],
    related_tags: ["capability-recovery", "exercise", "health-identity"],
    book_uses: ["memoir_arc", "scene_finder", "identity_arc"],
    candidate_chapters: ["No Longer Fragile"],
  },
  {
    concept_id: "hard-is-mandatory",
    name: "Hard Is Mandatory",
    definition:
      "Progress requires intentionally entering difficulty once yesterday's hard has become easy.",
    aliases: [
      "hard is mandatory",
      "hard intentionally",
      "you can do hard things",
      "the easy and the hard",
      "maximum effort",
      "push day",
    ],
    related_tags: ["exercise", "mindset", "capability-recovery"],
    book_uses: ["training_principle", "chapter_title"],
    candidate_chapters: ["Hard Is Mandatory"],
  },
  {
    concept_id: "reclaiming-abilities",
    name: "Reclaiming Abilities",
    definition:
      "The practical meaning of health: getting back the ability to serve, move, travel, work, and participate in family life.",
    aliases: [
      "reclaim",
      "abilities",
      "carry the load",
      "cane",
      "stairs",
      "mobility",
      "health recovery",
      "yard work",
    ],
    related_tags: ["capability-recovery", "family-responsibility", "nsv"],
    book_uses: ["emotional_core", "memoir_arc", "scene_finder"],
    candidate_chapters: ["Reclaiming Real Life"],
  },
  {
    concept_id: "feast-and-fast",
    name: "The Feast And The Fast",
    definition:
      "A rhythm of metabolic healing that combines abstinence with satisfying, intentional nourishment.",
    aliases: [
      "feast and the fast",
      "feast",
      "fast",
      "fasting and feasting",
      "why feast",
      "beauty of the feast",
      "break the fast",
    ],
    related_tags: ["fasting", "feasting", "type-2-diabetes"],
    book_uses: ["practical_protocol", "food_framework", "chapter_cluster"],
    candidate_chapters: ["The Feast And The Fast"],
  },
  {
    concept_id: "food-that-made-you-sick",
    name: "The Food That Made You Sick",
    definition:
      "Some foods are not neutral treats for Lee; they are the path back to sickness.",
    aliases: [
      "food making us sick",
      "food that made",
      "no moderation",
      "carbs vs fat",
      "just don't eat carbs",
      "abusive boyfriend",
      "type 2 diabetes is not a disease",
    ],
    related_tags: ["feasting", "type-2-diabetes", "food-addiction"],
    book_uses: ["food_framework", "reader_warning", "practical_boundary"],
    candidate_chapters: ["The Food That Made Me Sick"],
  },
  {
    concept_id: "body-as-feedback-system",
    name: "The Body As Feedback System",
    definition:
      "The body responds to inputs without sentiment; symptoms, labs, hunger, pain, and performance are feedback.",
    aliases: [
      "listen to your body",
      "speaking to your body",
      "your body doesn't care",
      "my body told me",
      "feedback",
    ],
    related_tags: ["mindset", "fasting", "exercise", "type-2-diabetes"],
    book_uses: ["practical_mindset", "chapter_theme"],
    candidate_chapters: ["Your Body Tells The Truth"],
  },
];

const STORY_TYPE_RULES = [
  {
    type: "relapse",
    words: ["relapse", "backslide", "regained", "restart", "old ways", "starting again"],
    book_uses: ["honest_setback", "reader_reassurance"],
  },
  {
    type: "victory",
    words: ["victory", "free", "normal", "off meds", "no longer", "5k", "a1c"],
    book_uses: ["chapter_opener", "proof_point"],
  },
  {
    type: "relationship",
    words: ["wife", "daughter", "grandson", "pawpaw", "father", "husband", "family"],
    book_uses: ["emotional_anchor", "stakes_scene"],
  },
  {
    type: "identity",
    words: ["former diabetic", "athlete", "new me", "identity", "no longer"],
    book_uses: ["identity_arc", "chapter_theme"],
  },
  {
    type: "transformation",
    words: ["used to", "no longer", "before", "after", "became", "reclaimed", "transformed"],
    book_uses: ["memoir_scene", "transformation_scene"],
  },
  {
    type: "struggle",
    words: ["pain", "fear", "struggle", "tempted", "hungry", "hard", "cane", "sick"],
    book_uses: ["reader_reassurance", "conflict_scene"],
  },
  {
    type: "humor",
    words: ["doritos", "clown pants", "scale", "liar", "stupid", "hippo"],
    book_uses: ["voice_bank", "humor_relief"],
  },
  {
    type: "wisdom",
    words: ["lesson", "learned", "mindset", "truth", "health", "choice", "discipline"],
    book_uses: ["chapter_thesis", "reader_motivation"],
  },
];

const DASHBOARD_QUESTIONS = [
  {
    question: "Where is the original Less of Lee weight-loss journey?",
    tags: ["original-less-of-lee-journey", "capability-recovery", "nsv"],
    required_tags: ["original-less-of-lee-journey"],
    keywords: ["less of lee", "weight", "obese", "onederland", "100lbs", "plateau"],
    types: ["victory", "relationship", "relapse", "struggle"],
  },
  {
    question: "Where is the Reversing Type 2 Diabetes journey?",
    tags: ["reversing-type-2-diabetes-journey", "type-2-diabetes", "a1c-labs", "health-identity"],
    required_tags: ["reversing-type-2-diabetes-journey"],
    keywords: ["diabetes", "diabetic", "a1c", "med", "insulin", "doctor", "lab", "remission"],
    types: ["victory", "transformation", "identity", "relapse", "struggle"],
  },
  {
    question: "Where are my best diabetes reversal stories?",
    tags: ["reversing-type-2-diabetes-journey", "type-2-diabetes", "a1c-labs", "health-identity"],
    required_tags: ["reversing-type-2-diabetes-journey"],
    keywords: ["diabetes", "diabetic", "a1c", "med", "insulin", "doctor", "lab"],
    types: ["victory", "transformation", "identity"],
  },
  {
    question: "Where are restart/failure/comeback stories?",
    tags: ["failure-restart", "mindset", "food-addiction"],
    keywords: ["restart", "again", "fail", "backslide", "regained", "rough year", "discipline"],
    types: ["relapse", "struggle", "transformation"],
  },
  {
    question: "Where are fasting stories?",
    tags: ["fasting", "feasting", "a1c-labs"],
    keywords: ["fast", "fasting", "hunger", "carnivore", "bbbe", "feast"],
    types: ["struggle", "transformation", "wisdom", "victory"],
  },
  {
    question: "Where are family/responsibility stories?",
    tags: ["family-responsibility", "capability-recovery", "health-identity"],
    keywords: ["family", "wife", "daughter", "grandson", "pawpaw", "father", "husband", "carry"],
    types: ["relationship", "identity", "transformation"],
  },
  {
    question: "Where are my mantras and recurring refrains?",
    tags: ["mantras", "mindset", "capability-recovery"],
    keywords: ["mantra", "start where you are", "make progress", "a little more", "bit farther", "always"],
    types: ["wisdom", "victory", "struggle", "transformation"],
  },
  {
    question: "Where are strong recurring concepts or chapter ideas?",
    tags: ["mindset", "health-identity", "capability-recovery"],
    concepts: true,
  },
];

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(reportsDir, { recursive: true });

function main() {
  const sourceFiles = fs
    .readdirSync(sourceDir)
    .filter(file => file.endsWith(".md"))
    .sort()
    .map(file => path.join(sourceDir, file));

  const posts = sourceFiles.map(readPost).sort((a, b) => {
    const dateSort = a.date.localeCompare(b.date);
    return dateSort || a.id.localeCompare(b.id);
  });

  const postTags = buildPostTags(posts);
  const storyCandidates = buildStoryCandidates(posts, postTags);
  const conceptCandidates = buildConceptCandidates(posts);

  writeJsonl(path.join(dataDir, "posts.jsonl"), posts.map(toPostRecord));
  writeJson(path.join(dataDir, "tags.json"), TAGS.map(toTagRecord));
  writeJsonl(path.join(dataDir, "post-tags.jsonl"), postTags);
  writeJsonl(path.join(dataDir, "story-candidates.jsonl"), storyCandidates);
  writeJson(path.join(dataDir, "concept-candidates.json"), conceptCandidates);

  writePostsCsv(posts, postTags);
  writeDashboard(posts, postTags, storyCandidates, conceptCandidates);
  writeStoryReport(storyCandidates);
  writeConceptReport(conceptCandidates);

  const validation = validateOutputs(posts, postTags, storyCandidates, conceptCandidates);
  writeValidationReport(validation, posts, postTags, storyCandidates);

  if (validation.failures.length > 0) {
    console.error(`Mining MVP completed with ${validation.failures.length} validation failures.`);
    process.exitCode = 1;
    return;
  }

  console.log("Mining MVP complete.");
  console.log(`Posts: ${posts.length}`);
  console.log(`Post tags: ${postTags.length}`);
  console.log(`Story candidates: ${storyCandidates.length}`);
  console.log(`Concept candidates: ${conceptCandidates.length}`);
}

function readPost(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);
  const id = path.basename(filePath, ".md");
  const slug = id.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const title = decodeHtml(frontmatter.title || titleFromSlug(slug));
  const date = String(frontmatter.pubDate || id.slice(0, 10));
  const sourceTags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.map(tag => decodeHtml(String(tag)))
    : [];
  const cleanBody = stripMarkdown(body);
  const summary = summarize(body);
  const imageMatches = body.match(/!\[[^\]]*]\([^)]+\)|<img\b/gi) || [];
  return {
    id,
    slug,
    title,
    date,
    updated_date: frontmatter.updatedDate || frontmatter.modDate || null,
    file_path: relativeFromProject(filePath),
    absolute_path: filePath,
    word_count: countWords(cleanBody),
    summary,
    source_tags: sourceTags,
    wordpress_url: frontmatter.wordpress_url || "",
    has_images: imageMatches.length > 0,
    image_count: imageMatches.length,
    body,
    clean_body: cleanBody,
  };
}

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { frontmatter: {}, body: raw };
  }
  const yaml = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();
  const frontmatter = {};
  for (const line of yaml.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    frontmatter[key] = parseYamlValue(rawValue.trim());
  }
  return { frontmatter, body };
}

function parseYamlValue(value) {
  if (value === "") return "";
  if (value === "[]" || value === "[ ]") return [];
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map(item => unquote(item.trim()));
  }
  return unquote(value);
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function decodeHtml(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "...");
}

function stripMarkdown(markdown) {
  return decodeHtml(markdown)
    .replace(/\[!\[[^\]]*]\([^)]+\)]\([^)]+\)/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_>#|~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarize(body) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .filter(paragraph => !isImageOnly(paragraph));
  const firstUseful = paragraphs.find(paragraph => {
    const clean = stripMarkdown(paragraph);
    return clean.split(/\s+/).filter(Boolean).length >= 8;
  });
  const clean = firstUseful ? stripMarkdown(firstUseful) : stripMarkdown(body);
  return truncateWords(clean, 38);
}

function countWords(text) {
  const matches = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)?/g);
  return matches ? matches.length : 0;
}

function buildPostTags(posts) {
  const records = [];
  for (const post of posts) {
    const haystack = `${post.title}\n${post.source_tags.join(" ")}\n${post.clean_body}`;
    const titleHaystack = post.title;
    const sourceTagHaystack = post.source_tags.join(" ");
    for (const tag of TAGS) {
      if (tag.id === "original-less-of-lee-journey" || tag.id === "reversing-type-2-diabetes-journey") {
        continue;
      }
      const hits = [];
      for (const alias of tag.aliases) {
        if (matchesAlias(sourceTagHaystack, alias)) {
          hits.push({ location: "source tag", alias, strength: aliasStrength(alias) });
        } else if (matchesAlias(titleHaystack, alias)) {
          hits.push({ location: "title", alias, strength: aliasStrength(alias) });
        } else if (matchesAlias(haystack, alias)) {
          hits.push({ location: "body", alias, strength: aliasStrength(alias) });
        }
      }
      if (hits.length === 0) continue;
      const hasSourceHit = hits.some(hit => hit.location === "source tag");
      const hasTitleHit = hits.some(hit => hit.location === "title");
      const bodyHits = hits.filter(hit => hit.location === "body");
      const bodyHasExact = bodyHits.some(hit => hit.strength === "exact");
      const bodyHasMultipleSignals = new Set(bodyHits.map(hit => normalize(hit.alias))).size >= 2;
      if (!hasSourceHit && !hasTitleHit && !bodyHasExact && !bodyHasMultipleSignals) continue;
      if (tag.id === "capability-recovery" && !hasSourceHit && !hasTitleHit && !bodyHasMultipleSignals) continue;
      if (tag.id === "mantras" && !hasSourceHit && !hasTitleHit && !bodyHasMantraSignal(bodyHits)) continue;
      const confidence = hasSourceHit
        ? 0.9
        : hasTitleHit
          ? 0.8
          : !bodyHasExact
            ? 0.45
            : 0.6;
      records.push({
        post_id: post.id,
        tag_id: tag.id,
        confidence,
        evidence: hits
          .map(hit => `${hit.location}: ${hit.alias}`)
          .filter((value, index, values) => values.indexOf(value) === index)
          .slice(0, 5),
      });
    }
    for (const journeyTag of journeyTagsForPost(post)) {
      if (records.some(record => record.post_id === post.id && record.tag_id === journeyTag.tag_id)) continue;
      records.push(journeyTag);
    }
  }
  return records.sort((a, b) => a.post_id.localeCompare(b.post_id) || a.tag_id.localeCompare(b.tag_id));
}

function journeyTagsForPost(post) {
  const records = [];
  if (post.date < "2021-01-01") {
    records.push({
      post_id: post.id,
      tag_id: "original-less-of-lee-journey",
      confidence: 0.95,
      evidence: ["journey: pre-2021 original Less of Lee archive"],
    });
  }
  if (post.date >= "2021-01-01") {
    records.push({
      post_id: post.id,
      tag_id: "reversing-type-2-diabetes-journey",
      confidence: 0.95,
      evidence: ["journey: 2021+ Type 2 diabetes reversal archive"],
    });
  }
  return records;
}

function bodyHasMantraSignal(bodyHits) {
  const canonicalSignals = new Set([
    "mantra",
    "mantras",
    "start where you are",
    "make progress",
    "make improvements",
    "a little more",
    "a bit farther",
    "always a little more",
    "i can't until i can",
    "i cant until i can",
  ]);
  return (
    bodyHits.some(hit => canonicalSignals.has(normalize(hit.alias))) ||
    new Set(bodyHits.map(hit => normalize(hit.alias))).size >= 2
  );
}

function buildStoryCandidates(posts, postTags) {
  const tagsByPost = groupTagsByPost(postTags);
  const candidates = [];
  for (const post of posts) {
    const tags = tagsByPost.get(post.id) || [];
    const titleScore = scoreTitle(post.title);
    const paragraph = bestParagraph(post);
    const tagScore = tags.length * 3;
    const totalScore = titleScore + paragraph.score + tagScore;
    if (totalScore < 16) continue;

    const typeInfo = classifyStory(post, paragraph.text);
    const themes = displayThemes(tags);
    const storyId = `${post.id}--story-01`;
    candidates.push({
      story_id: storyId,
      post_id: post.id,
      title: post.title,
      date: post.date,
      type: typeInfo.type,
      book_uses: [...new Set([...typeInfo.book_uses, ...bookUsesForTags(themes)])].slice(0, 6),
      themes,
      all_themes: tags,
      score: totalScore,
      source_excerpt: excerptFromParagraph(paragraph.raw || post.body),
      why_it_matters: whyStoryMatters(typeInfo.type, themes, post.title),
      file_path: post.file_path,
      wordpress_url: post.wordpress_url,
    });
  }
  return candidates
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date) || a.post_id.localeCompare(b.post_id))
    .slice(0, 180)
    .sort((a, b) => a.date.localeCompare(b.date) || a.post_id.localeCompare(b.post_id));
}

function scoreTitle(title) {
  const highSignals = [
    "a1c",
    "diabetes",
    "diabetic",
    "free",
    "former",
    "med",
    "fast",
    "fasting",
    "results",
    "lesson",
    "can't",
    "cant",
    "until i can",
    "start where",
    "fail",
    "again",
    "restart",
    "cane",
    "doctor",
    "lab",
    "no longer",
    "victory",
    "proof",
    "grandfather",
    "pawpaw",
    "arthritis",
  ];
  return highSignals.reduce((score, word) => (matchesAlias(title, word) ? score + 4 : score), 0);
}

function bestParagraph(post) {
  const paragraphs = post.body
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .filter(paragraph => !isImageOnly(paragraph));
  let best = { raw: paragraphs[0] || post.body, text: stripMarkdown(paragraphs[0] || post.body), score: 0 };
  for (const raw of paragraphs) {
    const text = stripMarkdown(raw);
    if (text.length < 40) continue;
    const score = scoreParagraph(text);
    if (score > best.score) best = { raw, text, score };
  }
  return best;
}

function scoreParagraph(text) {
  const groups = [
    ["used to", "no longer", "before", "after", "again"],
    ["pain", "fear", "couldn't", "couldnt", "struggle", "tempted", "hungry", "cane", "diabetic"],
    ["decided", "started", "stopped", "chose", "returned", "restarted", "fasted", "walked", "ran", "lifted"],
    ["result", "normal", "free", "off meds", "reclaimed", "improved", "lost", "stronger", "better"],
    ["a1c", "lbs", "pounds", "blood pressure", "insulin", "metformin", "trulicity", "glipizide"],
    ["wife", "daughter", "grandson", "pawpaw", "family", "husband", "father"],
  ];
  let score = 0;
  for (const group of groups) {
    for (const word of group) {
      if (matchesAlias(text, word)) score += 3;
    }
  }
  if (/\b\d+(\.\d+)?\b/.test(text)) score += 4;
  if (text.includes("?")) score += 1;
  return score;
}

function classifyStory(post, paragraphText) {
  const haystack = `${post.title}\n${paragraphText}\n${post.clean_body.slice(0, 800)}`;
  const scores = STORY_TYPE_RULES.map(rule => ({
    rule,
    score: rule.words.reduce((sum, word) => (matchesAlias(haystack, word) ? sum + 1 : sum), 0),
  }));
  const scoreFor = type => scores.find(item => item.rule.type === type)?.score || 0;

  if (scoreFor("relapse") >= 1 && scoreFor("victory") < scoreFor("relapse") + 2) {
    return STORY_TYPE_RULES.find(rule => rule.type === "relapse");
  }
  if (scoreFor("struggle") >= 2 && scoreFor("victory") < scoreFor("struggle") + 2) {
    return STORY_TYPE_RULES.find(rule => rule.type === "struggle");
  }
  if (scoreFor("relationship") >= 2) return STORY_TYPE_RULES.find(rule => rule.type === "relationship");
  if (scoreFor("identity") >= 2) return STORY_TYPE_RULES.find(rule => rule.type === "identity");

  const transformationScore = scoreFor("transformation");
  const bestNonTransformation = scores
    .filter(item => item.rule.type !== "transformation")
    .sort((a, b) => b.score - a.score)[0];
  if (bestNonTransformation && bestNonTransformation.score > 0 && transformationScore < bestNonTransformation.score + 3) {
    return bestNonTransformation.rule;
  }

  if (transformationScore >= 2) return STORY_TYPE_RULES.find(rule => rule.type === "transformation");
  return bestNonTransformation?.rule || STORY_TYPE_RULES.find(rule => rule.type === "wisdom");
}

function whyStoryMatters(type, themes, title) {
  const themeText = themes.slice(0, 3).join(", ");
  return `${title} is a ${type} candidate with signals for ${themeText || "book mining"}. Read the source post to decide whether it becomes a scene, chapter opener, or support example.`;
}

function buildConceptCandidates(posts) {
  const concepts = [];
  for (const seed of CONCEPT_SEEDS) {
    const hits = [];
    for (const post of posts) {
      const titleMatchedAliases = seed.aliases.filter(alias => matchesAlias(post.title, alias));
      const bodyMatchedAliases = seed.aliases.filter(alias => matchesAlias(post.clean_body, alias));
      const matchedAliases = seed.aliases.filter(
        alias => titleMatchedAliases.includes(alias) || bodyMatchedAliases.includes(alias),
      );
      if (matchedAliases.length === 0) continue;
      const titleExactAliases = titleMatchedAliases.filter(alias => aliasStrength(alias) === "exact");
      const bodyExactAliases = bodyMatchedAliases.filter(alias => aliasStrength(alias) === "exact");
      const evidenceStrength =
        titleExactAliases.length > 0 ||
        bodyExactAliases.some(alias => normalize(alias).includes(" ") && normalize(alias).length >= 8) ||
        (matchedAliases.length >= 2 && bodyExactAliases.length >= 1)
          ? "strong"
          : "weak";
      hits.push({
        post_id: post.id,
        title: post.title,
        date: post.date,
        file_path: post.file_path,
        title_match: titleMatchedAliases.length > 0,
        evidence_strength: evidenceStrength,
        matched_aliases: matchedAliases,
        evidence: [
          ...titleMatchedAliases.map(alias => ({ alias, location: "title", strength: aliasStrength(alias) })),
          ...bodyMatchedAliases.map(alias => ({ alias, location: "body", strength: aliasStrength(alias) })),
        ],
        quote: findQuoteForAliases(post.body, matchedAliases) || excerptFromParagraph(post.body),
      });
    }
    const strongHits = hits.filter(hit => hit.evidence_strength === "strong");
    const weakHits = hits.filter(hit => hit.evidence_strength === "weak");
    const sortedHits = hits.sort((a, b) => {
      if (a.evidence_strength !== b.evidence_strength) return a.evidence_strength === "strong" ? -1 : 1;
      if (a.title_match !== b.title_match) return a.title_match ? -1 : 1;
      return a.date.localeCompare(b.date) || a.post_id.localeCompare(b.post_id);
    });
    const sortedStrongHits = strongHits.sort((a, b) => {
      if (a.title_match !== b.title_match) return a.title_match ? -1 : 1;
      return a.date.localeCompare(b.date) || a.post_id.localeCompare(b.post_id);
    });
    concepts.push({
      concept_id: seed.concept_id,
      name: seed.name,
      definition: seed.definition,
      related_tags: seed.related_tags,
      book_uses: seed.book_uses,
      supporting_posts: sortedStrongHits.slice(0, 20),
      weak_supporting_posts: weakHits
        .sort((a, b) => a.date.localeCompare(b.date) || a.post_id.localeCompare(b.post_id))
        .slice(0, 20),
      frequency: strongHits.length,
      strong_matches: strongHits.length,
      weak_matches: weakHits.length,
      representative_quotes: sortedStrongHits.slice(0, 3).map(hit => ({
        post_id: hit.post_id,
        quote: truncateWords(stripMarkdown(hit.quote), 30),
      })),
      candidate_chapters: seed.candidate_chapters,
      status: strongHits.length >= 3 ? "candidate" : "seed",
    });
  }
  return concepts.sort((a, b) => b.frequency - a.frequency || a.concept_id.localeCompare(b.concept_id));
}

function toPostRecord(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: post.date,
    updated_date: post.updated_date,
    file_path: post.file_path,
    word_count: post.word_count,
    summary: post.summary,
    source_tags: post.source_tags,
    wordpress_url: post.wordpress_url,
    has_images: post.has_images,
    image_count: post.image_count,
  };
}

function toTagRecord(tag) {
  return {
    type: "topic",
    ...tag,
  };
}

function writePostsCsv(posts, postTags) {
  const tagsByPost = groupTagsByPost(postTags);
  const rows = [
    [
      "id",
      "date",
      "title",
      "word_count",
      "summary",
      "controlled_tags",
      "source_tags",
      "has_images",
      "wordpress_url",
      "file_path",
    ],
  ];
  for (const post of posts) {
    rows.push([
      post.id,
      post.date,
      post.title,
      String(post.word_count),
      post.summary,
      (tagsByPost.get(post.id) || []).join("; "),
      post.source_tags.join("; "),
      String(post.has_images),
      post.wordpress_url,
      post.file_path,
    ]);
  }
  fs.writeFileSync(path.join(reportsDir, "posts.csv"), rows.map(toCsvRow).join("\n") + "\n");
}

function writeDashboard(posts, postTags, storyCandidates, conceptCandidates) {
  const tagsByPost = groupTagsByPost(postTags);
  const storyByTag = new Map();
  for (const story of storyCandidates) {
    for (const tag of story.all_themes || story.themes) {
      if (!storyByTag.has(tag)) storyByTag.set(tag, []);
      storyByTag.get(tag).push(story);
    }
  }

  const lines = [];
  lines.push("# Book Mining Dashboard");
  lines.push("");
  lines.push("This is the first place to look when mining the Less of Lee archive for book material.");
  lines.push("");
  lines.push("## Snapshot");
  lines.push("");
  lines.push(`- Source posts indexed: ${posts.length}`);
  lines.push(`- Controlled vocabulary tags: ${TAGS.length}`);
  lines.push(`- Post-tag links: ${postTags.length}`);
  lines.push(`- Story candidates: ${storyCandidates.length}`);
  lines.push(`- Concept candidates: ${conceptCandidates.length}`);
  lines.push("");

  lines.push("## Health Journey Split");
  lines.push("");
  for (const journey of [
    ["original-less-of-lee-journey", "Original Less of Lee weight-loss journey"],
    ["reversing-type-2-diabetes-journey", "Reversing Type 2 Diabetes journey"],
  ]) {
    const [tagId, label] = journey;
    const journeyPosts = posts.filter(post => (tagsByPost.get(post.id) || []).includes(tagId));
    lines.push(`### ${label}`);
    lines.push("");
    if (journeyPosts.length === 0) {
      lines.push("- No posts tagged yet.");
      lines.push("");
      continue;
    }
    lines.push(`- Tagged posts: ${journeyPosts.length}`);
    lines.push(`- Date range: ${journeyPosts[0].date} to ${journeyPosts[journeyPosts.length - 1].date}`);
    lines.push("- Opening posts:");
    for (const post of journeyPosts.slice(0, 5)) {
      lines.push(`  - ${post.date} - ${post.title} - ${post.file_path}`);
    }
    lines.push("- Later posts:");
    for (const post of journeyPosts.slice(-5)) {
      lines.push(`  - ${post.date} - ${post.title} - ${post.file_path}`);
    }
    lines.push("");
  }

  lines.push("## Lee Questions");
  lines.push("");
  for (const item of DASHBOARD_QUESTIONS) {
    lines.push(`### ${item.question}`);
    lines.push("");
    if (item.concepts) {
      for (const concept of conceptCandidates.slice(0, DASHBOARD_CONCEPT_LIMIT)) {
        lines.push(
          `- ${concept.name} - ${concept.strong_matches} strong matches, ${concept.weak_matches} weak matches - ${concept.candidate_chapters.join("; ")}`,
        );
      }
    } else {
      const scoredStories = uniqueBy(
        item.tags.flatMap(tag => storyByTag.get(tag) || []),
        story => story.story_id,
      )
        .map(story => ({ story, question_score: scoreForQuestion(story, item) }))
        .filter(itemScore => itemScore.question_score > 0)
        .sort((a, b) =>
          b.question_score - a.question_score ||
          b.story.score - a.story.score ||
          b.story.date.localeCompare(a.story.date),
        );
      const stories = scoredStories.slice(0, DASHBOARD_STORY_LIMIT).map(itemScore => itemScore.story);
      if (stories.length === 0) {
        lines.push("- No candidates yet.");
      }
      lines.push("Top matches:");
      for (const story of stories) {
        lines.push(
          `- ${story.date} - ${story.title} (${story.type}, score ${story.score}) - ${story.file_path}`,
        );
      }
      lines.push("");
      lines.push("Memoir arc:");
      for (const story of scoredStories
        .map(itemScore => itemScore.story)
        .sort((a, b) => a.date.localeCompare(b.date) || a.post_id.localeCompare(b.post_id))
        .slice(0, DASHBOARD_STORY_LIMIT)) {
        lines.push(`- ${story.date} - ${story.title} (${story.type}) - ${story.file_path}`);
      }
    }
    lines.push("");
  }

  lines.push("## Strongest Concepts");
  lines.push("");
  for (const concept of conceptCandidates.slice(0, 10)) {
    lines.push(
      `- ${concept.name} - ${concept.strong_matches} strong matches, ${concept.weak_matches} weak matches - ${concept.candidate_chapters.join("; ")}`,
    );
  }
  lines.push("");

  lines.push("## Highest Scoring Story Candidates");
  lines.push("");
  for (const story of [...storyCandidates].sort((a, b) => b.score - a.score).slice(0, 20)) {
    lines.push(`- ${story.date} - ${story.title}`);
    lines.push(`  - Type: ${story.type}`);
    lines.push(`  - Themes: ${story.themes.join(", ")}`);
    lines.push(`  - Source: ${story.file_path}`);
    lines.push(`  - Excerpt: "${story.source_excerpt}"`);
  }
  lines.push("");

  lines.push("## How To Use This");
  lines.push("");
  lines.push("1. Pick the question that matches the chapter or book section you are writing.");
  lines.push("2. Open the listed source posts.");
  lines.push("3. Use story candidates as leads, not final editorial judgment.");
  lines.push("4. Promote the useful ones into curated story beats in the next sprint.");
  lines.push("");

  fs.writeFileSync(path.join(reportsDir, "book-mining-dashboard.md"), lines.join("\n"));
}

function scoreForQuestion(story, question) {
  const text = `${story.title} ${story.source_excerpt} ${story.why_it_matters}`;
  const storyTags = story.all_themes || story.themes;
  if (
    question.required_tags &&
    !storyTags.some(theme => question.required_tags.includes(theme))
  ) {
    return 0;
  }
  const tagScore = storyTags.filter(theme => question.tags.includes(theme)).length * 10;
  const keywordScore = (question.keywords || []).reduce(
    (score, keyword) => (matchesAlias(text, keyword) ? score + 8 : score),
    0,
  );
  const typeScore = (question.types || []).includes(story.type) ? 5 : 0;
  return tagScore + keywordScore + typeScore;
}

function writeStoryReport(storyCandidates) {
  const lines = ["# Story Candidates", ""];
  const byType = groupBy(storyCandidates, story => story.type);
  for (const type of [...byType.keys()].sort()) {
    lines.push(`## ${titleCase(type)}`);
    lines.push("");
    for (const story of byType.get(type).sort((a, b) => b.score - a.score).slice(0, 30)) {
      lines.push(`### ${story.title}`);
      lines.push("");
      lines.push(`- Date: ${story.date}`);
      lines.push(`- Score: ${story.score}`);
      lines.push(`- Themes: ${story.themes.join(", ")}`);
      lines.push(`- Book uses: ${story.book_uses.join(", ")}`);
      lines.push(`- Source: ${story.file_path}`);
      lines.push(`- Why it matters: ${story.why_it_matters}`);
      lines.push(`- Excerpt: "${story.source_excerpt}"`);
      lines.push("");
    }
  }
  fs.writeFileSync(path.join(reportsDir, "story-candidates.md"), lines.join("\n"));
}

function writeConceptReport(conceptCandidates) {
  const lines = ["# Concept Candidates", ""];
  for (const concept of conceptCandidates) {
    lines.push(`## ${concept.name}`);
    lines.push("");
    lines.push(concept.definition);
    lines.push("");
    lines.push(`- Status: ${concept.status}`);
    lines.push(`- Strong supporting posts: ${concept.strong_matches}`);
    lines.push(`- Weak matches not counted as support: ${concept.weak_matches}`);
    lines.push(`- Related tags: ${concept.related_tags.join(", ")}`);
    lines.push(`- Book uses: ${concept.book_uses.join(", ")}`);
    lines.push(`- Candidate chapters: ${concept.candidate_chapters.join("; ")}`);
    lines.push("");
    lines.push("Representative quotes:");
    for (const quote of concept.representative_quotes) {
      lines.push(`- ${quote.post_id}: "${quote.quote}"`);
    }
    lines.push("");
    lines.push("Top supporting posts:");
    for (const post of concept.supporting_posts.slice(0, 10)) {
      lines.push(`- ${post.date} - ${post.title} - ${post.file_path}`);
    }
    if (concept.weak_supporting_posts.length > 0) {
      lines.push("");
      lines.push("Weak matches to review separately:");
      for (const post of concept.weak_supporting_posts.slice(0, 5)) {
        lines.push(`- ${post.date} - ${post.title} - ${post.file_path}`);
      }
    }
    lines.push("");
  }
  fs.writeFileSync(path.join(reportsDir, "concept-candidates.md"), lines.join("\n"));
}

function validateOutputs(posts, postTags, storyCandidates, conceptCandidates) {
  const failures = [];
  const warnings = [];
  const postIds = new Set(posts.map(post => post.id));
  const tagIds = new Set(TAGS.map(tag => tag.id));

  if (posts.length !== EXPECTED_SOURCE_COUNT) {
    failures.push(`Expected ${EXPECTED_SOURCE_COUNT} posts, found ${posts.length}.`);
  }
  if (new Set(posts.map(post => post.id)).size !== posts.length) {
    failures.push("Duplicate post IDs found.");
  }
  for (const post of posts) {
    for (const field of ["id", "slug", "title", "date", "file_path", "summary"]) {
      if (!post[field]) failures.push(`Post ${post.id} has empty ${field}.`);
    }
    if (typeof post.word_count !== "number") failures.push(`Post ${post.id} has invalid word_count.`);
    if (!fs.existsSync(path.resolve(projectRoot, post.file_path))) {
      failures.push(`Post ${post.id} file_path does not resolve: ${post.file_path}.`);
    }
  }
  for (const record of postTags) {
    if (!postIds.has(record.post_id)) failures.push(`Post tag references missing post: ${record.post_id}.`);
    if (!tagIds.has(record.tag_id)) failures.push(`Post tag references missing tag: ${record.tag_id}.`);
  }
  for (const post of posts) {
    const journeyTags = postTags.filter(
      record =>
        record.post_id === post.id &&
        (record.tag_id === "original-less-of-lee-journey" ||
          record.tag_id === "reversing-type-2-diabetes-journey"),
    );
    if (journeyTags.length !== 1) {
      failures.push(`Post ${post.id} has ${journeyTags.length} health journey tags.`);
    }
  }
  for (const story of storyCandidates) {
    if (!postIds.has(story.post_id)) failures.push(`Story references missing post: ${story.story_id}.`);
    for (const theme of [...new Set([...(story.themes || []), ...(story.all_themes || [])])]) {
      if (!tagIds.has(theme)) failures.push(`Story ${story.story_id} uses unknown theme ${theme}.`);
    }
    const post = posts.find(candidate => candidate.id === story.post_id);
    if (post && !normalizeWhitespace(decodeHtml(post.body)).includes(normalizeWhitespace(story.source_excerpt))) {
      failures.push(`Story excerpt not found in source: ${story.story_id}.`);
    }
    if (/&[#a-zA-Z0-9]+;/.test(story.source_excerpt)) {
      failures.push(`Story excerpt contains HTML entity: ${story.story_id}.`);
    }
  }
  for (const concept of conceptCandidates) {
    for (const support of concept.supporting_posts) {
      if (!postIds.has(support.post_id)) {
        failures.push(`Concept ${concept.concept_id} references missing post ${support.post_id}.`);
      }
    }
    if (concept.frequency < 3) {
      warnings.push(`Concept ${concept.concept_id} has fewer than 3 supporting posts.`);
    }
  }

  const csvPath = path.join(reportsDir, "posts.csv");
  if (fs.existsSync(csvPath)) {
    const csvRows = fs.readFileSync(csvPath, "utf8").trim().split("\n").length - 1;
    if (csvRows !== posts.length) failures.push(`CSV rows ${csvRows} do not match posts ${posts.length}.`);
  } else {
    failures.push("reports/posts.csv does not exist.");
  }

  return { failures, warnings };
}

function writeValidationReport(validation, posts, postTags, storyCandidates) {
  const spotCheckIds = [
    "2012-04-13-less-of-lee",
    "2021-05-03-i8217m-back-8-years-later-8211-now-diabetic",
    "2021-07-31-off-all-diabetes-meds-8211-3-month-update",
    "2022-01-23-you-cant-do-ituntil-you-can",
    "2022-12-30-i-can8217t-until-i-can-8211-from-cane-to-5k",
    "2023-03-25-i-have-arrived-at-a1c-of-52",
    "2023-12-06-14-days-with-no-food",
    "2024-07-04-three-years-diabetes-free",
    "2025-05-31-i-rise-again-again",
    "2025-11-30-fall-2025-health-audit-the-results",
  ];
  const spotChecks = spotCheckIds
    .map(id => posts.find(post => post.id === id))
    .filter(Boolean)
    .map(post => ({
      id: post.id,
      title: post.title,
      date: post.date,
      file_path: post.file_path,
      summary: post.summary,
      word_count: post.word_count,
    }));

  const leeQuestions = DASHBOARD_QUESTIONS.map(item => ({
    question: item.question,
    found_candidates: item.concepts
      ? "concept report"
      : storyCandidates.filter(story => scoreForQuestion(story, item) > 0).length,
    tagged_posts:
      item.required_tags?.length === 1
        ? postTags.filter(record => record.tag_id === item.required_tags[0]).length
        : null,
  }));
  const journeyCounts = {
    original: postTags.filter(record => record.tag_id === "original-less-of-lee-journey").length,
    diabetes: postTags.filter(record => record.tag_id === "reversing-type-2-diabetes-journey").length,
  };

  const lines = ["# Validation Report", ""];
  lines.push("## Automated Checks");
  lines.push("");
  lines.push(`- Source post count: ${posts.length}`);
  lines.push(`- Expected source post count: ${EXPECTED_SOURCE_COUNT}`);
  lines.push(`- Required field completeness: ${validation.failures.some(failure => failure.includes("empty")) ? "FAIL" : "PASS"}`);
  lines.push(`- ID uniqueness: ${validation.failures.some(failure => failure.includes("Duplicate")) ? "FAIL" : "PASS"}`);
  lines.push(`- File path resolution: ${validation.failures.some(failure => failure.includes("file_path")) ? "FAIL" : "PASS"}`);
  lines.push(`- Story excerpt source check: ${validation.failures.some(failure => failure.includes("excerpt")) ? "FAIL" : "PASS"}`);
  lines.push(`- Story excerpt entity scan: ${validation.failures.some(failure => failure.includes("HTML entity")) ? "FAIL" : "PASS"}`);
  lines.push(`- CSV row count check: ${validation.failures.some(failure => failure.includes("CSV")) ? "FAIL" : "PASS"}`);
  lines.push(`- Health journey partition: ${journeyCounts.original} original + ${journeyCounts.diabetes} diabetes = ${journeyCounts.original + journeyCounts.diabetes}`);
  lines.push("");
  lines.push("## Test As Lee");
  lines.push("");
  lines.push("Dashboard questions checked against generated story candidates:");
  for (const item of leeQuestions) {
    if (typeof item.found_candidates === "number") {
      const taggedText = item.tagged_posts === null ? "" : ` across ${item.tagged_posts} tagged posts`;
      lines.push(`- ${item.question} ${item.found_candidates} candidates found${taggedText}`);
    } else {
      lines.push(`- ${item.question} covered by ${item.found_candidates}`);
    }
  }
  lines.push("");
  lines.push("Manual spot-check set for title/date/summary/source review:");
  for (const post of spotChecks) {
    lines.push(`- ${post.date} - ${post.title} - ${post.file_path} (${post.word_count} words)`);
  }
  lines.push("");
  lines.push("## Warnings");
  lines.push("");
  if (validation.warnings.length === 0) {
    lines.push("- None.");
  } else {
    validation.warnings.forEach(warning => lines.push(`- ${warning}`));
  }
  lines.push("");
  lines.push("## Failures");
  lines.push("");
  if (validation.failures.length === 0) {
    lines.push("- None.");
  } else {
    validation.failures.forEach(failure => lines.push(`- ${failure}`));
  }
  lines.push("");
  lines.push("## Caveats");
  lines.push("");
  lines.push("- Story candidates are heuristic leads, not curated manuscript-ready story beats.");
  lines.push("- Concept candidates are seeded from repeated phrases and keyword evidence.");
  lines.push("- Summaries come from the first useful body paragraph because imported descriptions are empty.");
  lines.push("- `pubDate` is treated as canonical even when filename date differs.");
  lines.push("");
  fs.writeFileSync(path.join(reportsDir, "validation.md"), lines.join("\n"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(filePath, records) {
  fs.writeFileSync(filePath, records.map(record => JSON.stringify(record)).join("\n") + "\n");
}

function toCsvRow(values) {
  return values.map(value => `"${String(value).replace(/"/g, '""').replace(/\r?\n/g, " ")}"`).join(",");
}

function groupTagsByPost(postTags) {
  const grouped = new Map();
  for (const record of postTags) {
    if (!grouped.has(record.post_id)) grouped.set(record.post_id, []);
    grouped.get(record.post_id).push(record.tag_id);
  }
  for (const [postId, tags] of grouped.entries()) {
    grouped.set(postId, [...new Set(tags)].sort());
  }
  return grouped;
}

function displayThemes(tags) {
  const journeyTags = tags.filter(
    tag => tag === "original-less-of-lee-journey" || tag === "reversing-type-2-diabetes-journey",
  );
  const topicTags = tags.filter(tag => !journeyTags.includes(tag));
  return [...journeyTags, ...topicTags].slice(0, 6);
}

function bookUsesForTags(tagIds) {
  return tagIds.flatMap(tagId => TAGS.find(tag => tag.id === tagId)?.book_uses || []);
}

function isImageOnly(paragraph) {
  const withoutImages = paragraph
    .replace(/\[!\[[^\]]*]\([^)]+\)]\([^)]+\)/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .trim();
  return withoutImages.length === 0;
}

function excerptFromParagraph(paragraph) {
  const raw = normalizeWhitespace(paragraph)
    .replace(/\[!\[[^\]]*]\([^)]+\)]\([^)]+\)/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/^\]\([^)]+\)/, "")
    .trim();
  const sentence = raw.match(/[^.!?]+[.!?]/)?.[0] || raw;
  return decodeHtml(truncateWordsExact(sentence.trim(), 34));
}

function findQuoteForAliases(body, aliases) {
  const paragraphs = body.split(/\n\s*\n/).filter(Boolean);
  for (const alias of aliases) {
    const paragraph = paragraphs.find(item => matchesAlias(item, alias));
    if (paragraph) return excerptFromParagraphContainingAlias(paragraph, alias);
  }
  return "";
}

function excerptFromParagraphContainingAlias(paragraph, alias) {
  const raw = normalizeWhitespace(paragraph)
    .replace(/\[!\[[^\]]*]\([^)]+\)]\([^)]+\)/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/^\]\([^)]+\)/, "")
    .trim();
  const sentences = raw.match(/[^.!?]+[.!?]?/g) || [raw];
  const sentence = sentences.find(item => matchesAlias(item, alias)) || raw;
  return decodeHtml(truncateWordsExact(sentence.trim(), 34));
}

function normalize(value) {
  return decodeHtml(String(value))
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9.'"\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesAlias(text, alias) {
  const normalizedText = ` ${normalize(text)} `;
  const normalizedAlias = normalize(alias);
  if (!normalizedAlias) return false;
  const escaped = normalizedAlias.split(/\s+/).map(escapeRegExp).join("\\s+");
  const boundary = isShortAlias(alias) ? "[^a-z0-9]" : "(?:^|[^a-z0-9])";
  const endBoundary = isShortAlias(alias) ? "[^a-z0-9]" : "(?:$|[^a-z0-9])";
  return new RegExp(`${boundary}${escaped}${endBoundary}`).test(normalizedText);
}

function isShortAlias(alias) {
  const normalizedAlias = normalize(alias);
  if (DISTINCTIVE_SHORT_ALIASES.has(normalizedAlias)) return false;
  if (normalizedAlias.includes(" ")) return false;
  return normalizedAlias.length <= 5;
}

function aliasStrength(alias) {
  const normalizedAlias = normalize(alias);
  if (AMBIGUOUS_ALIASES.has(normalizedAlias) || isShortAlias(alias)) return "ambiguous";
  return "exact";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function truncateWords(value, maxWords) {
  const words = normalizeWhitespace(value).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function truncateWordsExact(value, maxWords) {
  const words = normalizeWhitespace(value).split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

function relativeFromProject(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function titleCase(value) {
  return value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function groupBy(values, getKey) {
  const grouped = new Map();
  for (const value of values) {
    const key = getKey(value);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(value);
  }
  return grouped;
}

function uniqueBy(values, getKey) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const key = getKey(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

main();
