---
title: 'Migrating from WordPress to Astro'
description: 'Why I moved this blog from WordPress.com to a static site built with Astro and hosted on Cloudflare Pages'
pubDatetime: 2026-01-20T00:00:00Z
featured: true
tags:
  - astro
  - wordpress
  - migration
---

After years on WordPress.com, I've migrated this blog to a completely new stack. Here's why and how.

## Why Leave WordPress?

WordPress.com served me well, but I wanted:

- **Speed**: Static HTML loads instantly. No PHP, no database queries, no server-side rendering.
- **Reliability**: Static files on a CDN don't go down. No plugin conflicts, no security patches, no "Error establishing database connection."
- **Cost**: Free hosting on Cloudflare Pages. No annual WordPress.com fees.
- **Control**: My content lives as Markdown files in a Git repository. I can switch hosts anytime.
- **Simplicity**: Write in Markdown, push to Git, done.

## The New Stack

| Layer | Technology |
|-------|------------|
| Framework | [Astro](https://astro.build) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |
| Content | Markdown files |
| Search | [Pagefind](https://pagefind.app) (static, client-side) |
| Images | Optimized at build time with Sharp |

### Why Astro?

Astro is a static site generator designed for content-focused websites. Key benefits:

- **Zero JavaScript by default**: Pages are pure HTML unless you explicitly add interactivity
- **Content Collections**: Type-safe frontmatter validation catches errors before deployment
- **Fast builds**: The entire site rebuilds in seconds
- **Markdown-first**: Write posts in plain Markdown, Astro handles the rest

### Why Cloudflare Pages?

- **Free tier** covers everything I need
- **Global CDN** serves content from edge locations worldwide
- **Automatic HTTPS** with zero configuration
- **Git integration** deploys on every push
- **Preview deployments** for pull requests

## The Migration Process

The migration involved:

1. **Export** content from WordPress (Tools → Export → All content)
2. **Convert** the XML export to Markdown files with a custom Node.js script
3. **Download** all images locally so they're optimized at build time
4. **Generate redirects** so old URLs still work (SEO continuity)
5. **Deploy** to Cloudflare Pages

The conversion script handles the messy parts: WordPress's HTML-heavy content becomes clean Markdown, images are downloaded from WordPress.com servers to live in the repository, and a `_redirects` file ensures old links don't break.

## What's Different

**Faster**: Pages load almost instantly. No waiting for WordPress to query a database and render PHP.

**Simpler**: No plugins to update, no security vulnerabilities to patch, no admin dashboard to maintain.

**Portable**: The entire blog is a folder of Markdown files. If Cloudflare disappeared tomorrow, I could deploy to Netlify, Vercel, or GitHub Pages in minutes.

**Searchable**: Pagefind indexes the site at build time. Search works entirely in your browser - no server required.

## What's the Same

The content. Every post made the journey. URLs redirect properly. RSS feed still works.

## Source Code

The site is open source. You can see exactly how it's built:

- Astro configuration
- Content schema
- WordPress conversion script
- Build and deployment setup

If you're considering a similar migration, feel free to use it as a reference.

---

This post marks the first deployment to the new infrastructure. If you're reading this, the migration worked.
