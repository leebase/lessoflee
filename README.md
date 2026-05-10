# Less of Lee

Static Astro site for the Less of Lee health journey archive.

The project preserves and republishes articles originally hosted at `lessoflee.wordpress.com`, including imported Markdown posts and local image assets.

## Main Site

- Framework: Astro
- Content source for the current Astro collection: `src/data/blog`
- Imported WordPress article archive: `src/content/blog`
- Imported post images: `src/assets/posts`
- WordPress export converter: `scripts/convert-wordpress.js`
- WordPress.com RSS scraper: `scripts/scrape-wordpress.js`

## Data Mining Subproject

The `lessOfLeeDataMining` subproject exists to mine the WordPress article archive for book material.

Start here:

- `lessOfLeeDataMining/project-definition.md`

Its purpose is to build a structured, searchable layer over `src/content/blog` so the archive can be mined for:

- reusable stories and scenes
- recurring themes and topics
- Less of Lee concepts and phrases
- transformation timeline events
- quotes and source excerpts
- candidate book and chapter material

The initial strategy is intentionally simple: create inspectable JSONL, JSON, CSV, and Markdown reports before adding heavier tools like RAG or graph databases.

## Commands

```sh
npm install
npm run dev
npm run build
npm run scrape
npm run convert
```

