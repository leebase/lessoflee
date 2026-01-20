/**
 * WordPress to Astro Conversion Script
 *
 * This script converts WordPress export XML to Astro-compatible Markdown.
 *
 * Features:
 * - Parses WordPress XML directly for full control
 * - Downloads all images (including inline) to local assets
 * - Captures both pubDate and updatedDate (GMT)
 * - Generates _redirects file for Cloudflare Pages
 * - Skips non-post content (attachments, nav items, etc.)
 *
 * Usage:
 * 1. Export your WordPress content from wp-admin -> Tools -> Export -> Export All
 * 2. Save the XML file as 'wordpress-export.xml' in the project root
 * 3. Run: npm run convert
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseStringPromise } from 'xml2js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const EXPORT_FILE = path.join(rootDir, 'wordpress-export.xml');
const POSTS_OUTPUT = path.join(rootDir, 'src', 'data', 'blog');
const IMAGES_OUTPUT = path.join(rootDir, 'src', 'assets', 'posts');
const REDIRECTS_FILE = path.join(rootDir, 'public', '_redirects');

// Track all downloaded images to avoid duplicates
const downloadedImages = new Map();
// Track redirects
const redirects = [];
// Stats
const stats = {
  posts: 0,
  pages: 0,
  images: 0,
  skipped: []
};

async function main() {
  console.log('🚀 WordPress to Astro Conversion');
  console.log('================================\n');

  // Check if export file exists
  if (!fs.existsSync(EXPORT_FILE)) {
    console.error('❌ wordpress-export.xml not found in project root.\n');
    console.log('To export your WordPress content:');
    console.log('1. Go to your WordPress dashboard');
    console.log('2. Navigate to Tools → Export');
    console.log('3. Select "All content" and click "Download Export File"');
    console.log('4. Save the file as "wordpress-export.xml" in this project folder');
    process.exit(1);
  }

  console.log('📥 Found wordpress-export.xml\n');

  // Ensure output directories exist
  fs.mkdirSync(POSTS_OUTPUT, { recursive: true });
  fs.mkdirSync(IMAGES_OUTPUT, { recursive: true });
  fs.mkdirSync(path.dirname(REDIRECTS_FILE), { recursive: true });

  // Parse XML
  console.log('📖 Parsing WordPress export...');
  const xmlContent = fs.readFileSync(EXPORT_FILE, 'utf-8');
  const result = await parseStringPromise(xmlContent, { explicitArray: false });

  const channel = result.rss.channel;
  const items = Array.isArray(channel.item) ? channel.item : [channel.item];

  console.log(`   Found ${items.length} items in export\n`);

  // Process items
  console.log('🔄 Processing content...\n');

  for (const item of items) {
    await processItem(item);
  }

  // Write redirects file
  if (redirects.length > 0) {
    const redirectsContent = redirects.join('\n') + '\n';
    fs.writeFileSync(REDIRECTS_FILE, redirectsContent);
    console.log(`\n📝 Generated _redirects with ${redirects.length} entries`);
  }

  // Summary
  console.log('\n================================');
  console.log('✅ Conversion complete!\n');
  console.log(`   📄 Posts converted: ${stats.posts}`);
  console.log(`   📑 Pages converted: ${stats.pages}`);
  console.log(`   🖼️  Images downloaded: ${stats.images}`);

  if (stats.skipped.length > 0) {
    console.log(`\n   ⏭️  Skipped ${stats.skipped.length} items:`);
    const skippedTypes = {};
    stats.skipped.forEach(s => {
      skippedTypes[s.type] = (skippedTypes[s.type] || 0) + 1;
    });
    Object.entries(skippedTypes).forEach(([type, count]) => {
      console.log(`      - ${type}: ${count}`);
    });
  }

  console.log(`\n   Posts saved to: ${POSTS_OUTPUT}`);
  console.log(`   Images saved to: ${IMAGES_OUTPUT}`);
  console.log('\nNext steps:');
  console.log('1. Review a few posts to ensure formatting looks correct');
  console.log('2. Run "npm run dev" to preview your site');
  console.log('3. Run "npm run build" to build for production');
}

async function processItem(item) {
  const postType = item['wp:post_type'];
  const status = item['wp:status'];

  // Only process published posts and pages
  if (status !== 'publish') {
    stats.skipped.push({ type: `${postType} (${status})`, title: item.title });
    return;
  }

  if (postType === 'post') {
    await processPost(item);
    stats.posts++;
  } else if (postType === 'page') {
    await processPost(item, true);
    stats.pages++;
  } else {
    // Skip attachments, nav_menu_item, etc.
    stats.skipped.push({ type: postType, title: item.title });
  }
}

async function processPost(item, isPage = false) {
  const title = item.title || 'Untitled';
  const slug = item['wp:post_name'] || slugify(title);

  // Get dates - use GMT versions to avoid timezone issues
  const pubDateRaw = item['wp:post_date_gmt'] || item['wp:post_date'] || item.pubDate;
  const modifiedDateRaw = item['wp:post_modified_gmt'] || item['wp:post_modified'];

  const pubDate = formatDate(pubDateRaw);
  const modDate = formatDate(modifiedDateRaw);

  // Get content
  let content = item['content:encoded'] || '';

  // Extract excerpt/description
  const excerpt = item['excerpt:encoded'] || '';
  const description = excerpt
    ? stripHtml(excerpt).slice(0, 160)
    : extractExcerpt(content);

  // Download and fix images
  content = await processImages(content, slug);

  // Convert HTML to Markdown
  content = htmlToMarkdown(content);

  // Build frontmatter (AstroPaper format)
  let frontmatter = `---
title: '${escapeYaml(title)}'
description: '${escapeYaml(description)}'
pubDatetime: ${pubDate}T00:00:00Z`;

  // Only add modDatetime if it's different from pubDatetime
  if (modDate && modDate !== pubDate) {
    frontmatter += `\nmodDatetime: ${modDate}T00:00:00Z`;
  }

  frontmatter += `
tags:
  - imported
---`;

  // Build file content
  const fileContent = `${frontmatter}\n\n${content.trim()}\n`;

  // Save file
  const filename = `${slug}.md`;
  const destPath = path.join(POSTS_OUTPUT, filename);
  fs.writeFileSync(destPath, fileContent);
  console.log(`   ✓ ${filename}`);

  // Generate redirect if URL structure changes
  // WordPress: /yyyy/mm/slug/ or /slug/
  // AstroPaper: /posts/slug/
  const oldLink = item.link;
  if (oldLink) {
    const oldPath = new URL(oldLink).pathname;
    const newPath = `/posts/${slug}/`;
    if (oldPath !== newPath && oldPath !== `/${slug}/`) {
      redirects.push(`${oldPath} ${newPath} 301`);
    }
  }
}

async function processImages(content, postSlug) {
  // Find all image URLs (WordPress.com, wp-content, or already relative)
  const imgPatterns = [
    // HTML img tags
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
    // Markdown images
    /!\[[^\]]*\]\(([^)]+)\)/gi,
    // WordPress figure blocks
    /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg)/gi
  ];

  const imageUrls = new Set();

  for (const pattern of imgPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      const url = match[1] || match[0];
      if (url.startsWith('http')) {
        imageUrls.add(url);
      }
    }
  }

  // Download each image and replace URLs
  for (const url of imageUrls) {
    try {
      const localPath = await downloadImage(url);
      if (localPath) {
        // Replace all occurrences of this URL with the local path
        const relativePath = `../../assets/posts/${path.basename(localPath)}`;
        content = content.split(url).join(relativePath);
      }
    } catch (err) {
      console.warn(`   ⚠️ Failed to download image: ${url}`);
    }
  }

  return content;
}

async function downloadImage(url) {
  // Check if already downloaded
  if (downloadedImages.has(url)) {
    return downloadedImages.get(url);
  }

  // Generate local filename
  const urlObj = new URL(url);
  let filename = path.basename(urlObj.pathname);

  // Handle WordPress.com URLs that may have query params
  filename = filename.split('?')[0];

  // Ensure unique filename
  let destPath = path.join(IMAGES_OUTPUT, filename);
  let counter = 1;
  while (fs.existsSync(destPath) && !downloadedImages.has(url)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    destPath = path.join(IMAGES_OUTPUT, `${base}-${counter}${ext}`);
    counter++;
  }

  // Download
  await new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        downloadImage(response.headers.location)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });

  downloadedImages.set(url, destPath);
  stats.images++;
  return destPath;
}

function htmlToMarkdown(html) {
  if (!html) return '';

  let md = html
    // WordPress block comments
    .replace(/<!-- \/?wp:[^>]+ -->/g, '')
    // Paragraphs
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    // Headers
    .replace(/<h1[^>]*>/gi, '\n\n# ')
    .replace(/<\/h1>/gi, '\n')
    .replace(/<h2[^>]*>/gi, '\n\n## ')
    .replace(/<\/h2>/gi, '\n')
    .replace(/<h3[^>]*>/gi, '\n\n### ')
    .replace(/<\/h3>/gi, '\n')
    .replace(/<h4[^>]*>/gi, '\n\n#### ')
    .replace(/<\/h4>/gi, '\n')
    // Bold/italic
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<b[^>]*>/gi, '**')
    .replace(/<\/b>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<i[^>]*>/gi, '*')
    .replace(/<\/i>/gi, '*')
    // Links
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '[$2]($1)')
    // Images (convert to markdown)
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '![$1]($2)')
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*\/?>/gi, '![]($1)')
    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    // Code blocks
    .replace(/<pre[^>]*><code[^>]*>/gi, '\n```\n')
    .replace(/<\/code><\/pre>/gi, '\n```\n')
    .replace(/<code[^>]*>/gi, '`')
    .replace(/<\/code>/gi, '`')
    // Blockquotes
    .replace(/<blockquote[^>]*>/gi, '\n> ')
    .replace(/<\/blockquote>/gi, '\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Figures
    .replace(/<figure[^>]*>/gi, '\n')
    .replace(/<\/figure>/gi, '\n')
    .replace(/<figcaption[^>]*>([^<]*)<\/figcaption>/gi, '*$1*\n')
    // Divs and spans
    .replace(/<\/?div[^>]*>/gi, '\n')
    .replace(/<\/?span[^>]*>/gi, '')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return md;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractExcerpt(content, maxLength = 160) {
  const text = stripHtml(content);
  const firstParagraph = text.split(/\n\n/)[0] || text;

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  return firstParagraph.slice(0, maxLength - 3).trim() + '...';
}

function formatDate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') {
    return null;
  }

  try {
    // WordPress GMT format: "2024-01-15 14:30:00"
    const date = new Date(dateStr.replace(' ', 'T') + 'Z');
    if (isNaN(date.getTime())) {
      return null;
    }
    // Return as ISO date string (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeYaml(str) {
  if (!str) return '';
  return str
    .replace(/'/g, "''")
    .replace(/\n/g, ' ')
    .trim();
}

main().catch((err) => {
  console.error('❌ Conversion failed:', err);
  process.exit(1);
});
