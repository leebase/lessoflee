---
title: 'Understanding This Blog''s Tech Stack'
description: 'A deep dive into the technologies powering this blog - from Node.js and npm to Astro, TypeScript, and beyond'
pubDate: 'Jan 20 2026'
---

If you're reading this, you're experiencing the output of a carefully chosen set of modern web technologies. This post breaks down every layer of the stack, explaining what each piece does and why it matters.

## The Foundation: Node.js and npm

### Node.js

[Node.js](https://nodejs.org/) is a JavaScript runtime built on Chrome's V8 engine. It lets you run JavaScript outside the browser - on your computer, on servers, anywhere. This blog uses Node.js v24.

**Why it matters:** Every tool in this stack runs on Node.js. When you run `npm run dev`, Node.js is the engine executing that command.

### npm (Node Package Manager)

npm is the package manager that comes bundled with Node.js. It handles:

- **Installing dependencies** - Downloads libraries your project needs
- **Running scripts** - Executes commands defined in `package.json`
- **Managing versions** - Ensures consistent dependency versions via `package-lock.json`

Our `package.json` defines these scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "astro preview"
  }
}
```

When you run `npm run dev`, npm looks up "dev" in scripts and executes `astro dev`.

## The Framework: Astro

[Astro](https://astro.build/) is a modern static site generator designed for content-focused websites. Version 5.x powers this blog.

### Key Concepts

**Islands Architecture:** Astro ships zero JavaScript by default. Interactive components only load when needed - the rest is pure HTML and CSS.

**Content Collections:** Blog posts live in `src/content/blog/` as Markdown files. Astro validates them against a schema:

```typescript
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});
```

This ensures every post has a title, description, and publication date. TypeScript catches errors before they reach production.

**File-based Routing:** The URL structure mirrors the file structure:

| File | URL |
|------|-----|
| `src/pages/index.astro` | `/` |
| `src/pages/about.astro` | `/about` |
| `src/pages/blog/[...slug].astro` | `/blog/post-name/` |
| `src/pages/archive/[year].astro` | `/archive/2024/` |

### Astro Components

Files ending in `.astro` are Astro components. They combine HTML, CSS, and JavaScript in a single file:

```astro
---
// This is the "frontmatter" - runs at build time
const title = "Hello World";
---

<h1>{title}</h1>

<style>
  h1 { color: navy; }
</style>
```

The CSS is automatically scoped to this component - it won't leak to other parts of the site.

## TypeScript

[TypeScript](https://www.typescriptlang.org/) adds static types to JavaScript. This project uses Astro's strict configuration:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

**Why it matters:** TypeScript catches bugs at build time. If you try to access a property that doesn't exist, or pass the wrong type to a function, TypeScript tells you before your users see a broken page.

## Content Formats: Markdown and MDX

### Markdown

Most blog posts are written in Markdown (`.md` files). It's a simple syntax for writing formatted text:

```markdown
# Heading
**bold** and *italic*
- bullet points
[links](https://example.com)
```

Astro transforms this into HTML at build time.

### MDX

[MDX](https://mdxjs.com/) extends Markdown with JSX - you can import and use components inside your posts:

```mdx
import Chart from '../components/Chart.astro';

# My Post

Here's a chart:

<Chart data={[1, 2, 3]} />
```

This blog has `@astrojs/mdx` installed, enabling `.mdx` files in the content folder.

## Zod: Schema Validation

[Zod](https://zod.dev/) is a TypeScript-first schema validation library. Astro uses it to validate content frontmatter.

When you write a blog post with this frontmatter:

```yaml
---
title: 'My Post'
description: 'A description'
pubDate: 'Jan 20 2026'
---
```

Zod validates it against the schema. If you forget the title, Astro throws an error at build time - not when a user visits the page.

## Image Processing: Sharp

[Sharp](https://sharp.pixelplumbing.com/) is a high-performance image processing library. When you reference an image in a blog post:

```markdown
heroImage: '../../assets/my-image.jpg'
```

Astro uses Sharp to:

- **Resize** images to appropriate dimensions
- **Convert** formats (e.g., to WebP for smaller file sizes)
- **Optimize** compression
- **Generate** multiple sizes for responsive images

This happens at build time, so users get optimized images without any runtime cost.

## Search: Pagefind

[Pagefind](https://pagefind.app/) provides static search functionality. Unlike server-based search, Pagefind:

1. Indexes your site at build time
2. Ships a small JavaScript bundle
3. Searches entirely in the browser

The build script runs Pagefind after Astro builds the site:

```json
"build": "astro build && pagefind --site dist"
```

Visit `/search` to try it.

## RSS and Sitemap

### RSS Feed

The `@astrojs/rss` package generates an RSS feed at `/rss.xml`. RSS readers can subscribe to get notified of new posts.

### Sitemap

The `@astrojs/sitemap` integration generates a sitemap at `/sitemap.xml`. Search engines use this to discover and index all pages on the site.

Both are configured in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap()],
});
```

## Project Structure

Here's how everything fits together:

```
lessoflee/
├── src/
│   ├── content/
│   │   └── blog/           # Markdown/MDX posts live here
│   ├── pages/
│   │   ├── index.astro     # Homepage
│   │   ├── about.astro     # About page
│   │   ├── search.astro    # Search page
│   │   ├── 404.astro       # Not found page
│   │   ├── rss.xml.js      # RSS feed generator
│   │   ├── blog/
│   │   │   ├── [...slug].astro   # Individual post pages
│   │   │   └── [...page].astro   # Blog listing with pagination
│   │   └── archive/
│   │       ├── index.astro       # Archive overview
│   │       └── [year].astro      # Posts by year
│   ├── components/         # Reusable Astro components
│   ├── layouts/            # Page layouts
│   ├── styles/             # Global CSS
│   └── content.config.ts   # Content collection schemas
├── public/                 # Static assets (copied as-is)
├── astro.config.mjs        # Astro configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## The Build Process

When you run `npm run build`, here's what happens:

1. **Astro compiles** `.astro`, `.md`, and `.mdx` files into HTML
2. **TypeScript checks** for type errors
3. **Sharp optimizes** images
4. **CSS is extracted** and minified
5. **Output goes to** `dist/` folder
6. **Pagefind indexes** the built site for search

The result is a folder of static HTML, CSS, and minimal JavaScript - ready to deploy anywhere.

## Why This Stack?

This combination offers:

- **Performance**: Static HTML loads instantly. No server rendering, no JavaScript framework overhead.
- **Developer Experience**: TypeScript catches errors early. Hot reload shows changes immediately.
- **Content First**: Write in Markdown, get a fast website. No database required.
- **Flexibility**: Need interactivity? Add it where needed without bloating the whole site.
- **Portability**: The output is just files. Host it on any static host - Netlify, Vercel, GitHub Pages, or your own server.

---

Now you know what's under the hood. The best part? You don't need to understand all of this to write a blog post - just create a Markdown file in `src/content/blog/` and the stack handles the rest.
