#!/usr/bin/env node
/**
 * WordPress.com Site Scraper for Less of Lee
 * 
 * Scrapes all posts from lessoflee.wordpress.com using RSS feeds
 * - Fetches all RSS pages (paginated)
 * - Downloads images locally
 * - Converts HTML to Markdown
 * - Preserves frontmatter (title, date, tags, categories)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Configuration
const SITE_URL = 'https://lessoflee.wordpress.com';
const RSS_URL = `${SITE_URL}/feed/`;
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'blog');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'src', 'assets', 'posts');

// Delay between requests to be respectful
const REQUEST_DELAY = 1000;
const IMAGE_DELAY = 200;

// Track progress
let totalPosts = 0;
let downloadedImages = 0;
let skippedImages = 0;
let failedImages = 0;

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch URL with retry logic
 */
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        redirect: 'follow'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1}/${retries} for ${url.substring(0, 60)}...`);
      await sleep(2000 * (i + 1));
    }
  }
}

/**
 * Download binary data (for images)
 */
async function fetchBinary(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        redirect: 'follow'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.arrayBuffer();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000 * (i + 1));
    }
  }
}

/**
 * Parse XML and extract items
 */
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const extractCData = (tag) => {
      const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`);
      const m = itemXml.match(regex);
      return m ? m[1].replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim() : '';
    };
    
    // Extract all category tags
    const categories = [];
    const catRegex = /<category>(?:<!\[CDATA\[)?([^\]]+?)(?:\]\]>)?<\/category>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(itemXml)) !== null) {
      categories.push(catMatch[1].trim());
    }
    
    items.push({
      title: extractCData('title'),
      link: extractCData('link'),
      pubDate: extractCData('pubDate'),
      creator: extractCData('dc:creator'),
      description: extractCData('description'),
      content: extractCData('content:encoded'),
      categories
    });
  }
  
  return items;
}

/**
 * Extract image URLs from HTML content
 */
function extractImageUrls(html) {
  const urls = [];
  const regex = /<img[^>]+src="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let url = match[1];
    // Clean up WordPress image URLs - remove query params
    if (url.includes('?')) {
      url = url.split('?')[0];
    }
    // Skip data URIs and anchors
    if (url.startsWith('data:') || url.startsWith('#')) continue;
    urls.push(url);
  }
  return [...new Set(urls)]; // Deduplicate
}

/**
 * Download an image and return local path
 */
async function downloadImage(url, postSlug) {
  try {
    // Create post-specific image directory
    const postImageDir = path.join(IMAGES_DIR, postSlug);
    await fs.mkdir(postImageDir, { recursive: true });
    
    // Generate filename from URL
    let filename;
    try {
      const urlObj = new URL(url);
      filename = path.basename(urlObj.pathname);
    } catch {
      filename = null;
    }
    
    if (!filename || filename === '/' || !filename.includes('.')) {
      // Generate filename from URL hash
      const hash = Buffer.from(url).toString('base64').substring(0, 8);
      filename = `image-${hash}.jpg`;
    }
    
    // Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const localPath = path.join(postImageDir, filename);
    // Astro image path (from src/content/blog perspective)
    const astroPath = `~/assets/posts/${postSlug}/${filename}`;
    
    // Check if already downloaded
    try {
      await fs.access(localPath);
      skippedImages++;
      return { success: true, localPath: astroPath, filename, skipped: true };
    } catch {
      // File doesn't exist, continue to download
    }
    
    // Download image
    const buffer = await fetchBinary(url);
    await fs.writeFile(localPath, Buffer.from(buffer));
    
    downloadedImages++;
    return { success: true, localPath: astroPath, filename };
  } catch (err) {
    failedImages++;
    return { success: false, originalUrl: url, error: err.message };
  }
}

/**
 * Convert HTML content to Markdown
 */
function htmlToMarkdown(html) {
  let md = html;
  
  // Decode common HTML entities
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8230;': '...',
    '&#160;': ' ',
    '&hellip;': '...',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ndash;': '–',
    '&mdash;': '—'
  };
  
  for (const [entity, char] of Object.entries(entities)) {
    md = md.replace(new RegExp(entity, 'g'), char);
  }
  
  // Remove empty paragraphs
  md = md.replace(/<p[^>]*>\s*<\/p>/gi, '');
  
  // Convert headers
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  
  // Convert bold and italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  
  // Convert line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  // Convert paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  
  // Convert lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '\n$1\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '\n$1\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  
  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');
  
  // Handle figure/caption
  md = md.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, '\n$1\n');
  md = md.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, '*$1*\n');
  
  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Clean up WordPress-specific classes
  md = md.replace(/class="[^"]*"/g, '');
  
  // Clean up remaining div/span tags
  md = md.replace(/<\/?(span|div)[^>]*>/gi, '');
  
  // Normalize whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();
  
  return md;
}

/**
 * Process images in content - download and update URLs
 */
async function processImages(content, postSlug) {
  const imageUrls = extractImageUrls(content);
  
  if (imageUrls.length === 0) {
    return { content, imageMap: new Map() };
  }
  
  console.log(`  📥 Downloading ${imageUrls.length} images...`);
  
  const imageMap = new Map();
  
  for (const url of imageUrls) {
    await sleep(IMAGE_DELAY);
    const result = await downloadImage(url, postSlug);
    if (result.success) {
      imageMap.set(url, result);
    }
  }
  
  // Replace URLs in content
  let processedContent = content;
  for (const [originalUrl, result] of imageMap) {
    // Create pattern that matches URL with or without query params
    const baseUrl = originalUrl.split('?')[0];
    const escaped = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`src="${escaped}[^"]*"`, 'g');
    processedContent = processedContent.replace(regex, `src="${result.localPath}"`);
  }
  
  return { content: processedContent, imageMap };
}

/**
 * Generate slug from title and date
 */
function generateSlug(title, pubDate) {
  const date = new Date(pubDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Create slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
    .replace(/-+$/, '');
  
  return `${year}-${month}-${day}-${slug || 'untitled'}`;
}

/**
 * Format date for frontmatter (YYYY-MM-DD)
 */
function formatDate(pubDate) {
  return new Date(pubDate).toISOString().split('T')[0];
}

/**
 * Create Markdown file from post data
 */
async function createMarkdownFile(post, index) {
  const slug = generateSlug(post.title, post.pubDate);
  const filename = `${slug}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  // Check if already processed
  try {
    await fs.access(filepath);
    console.log(`  ⏭️  Skipped (already exists): ${filename}`);
    return filename;
  } catch {
    // File doesn't exist, continue processing
  }
  
  // Process images
  const { content: processedContent, imageMap } = await processImages(post.content, slug);
  
  // Convert to Markdown
  let markdownContent = htmlToMarkdown(processedContent);
  
  // Convert images to markdown format
  markdownContent = markdownContent.replace(
    /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi,
    (match, src, alt) => `![${alt || ''}](${src})`
  );
  markdownContent = markdownContent.replace(
    /<img[^>]+src="([^"]+)"[^>]*>/gi,
    (match, src) => `![](${src})`
  );
  
  // Clean up any remaining HTML tags
  markdownContent = markdownContent.replace(/<[^>]+>/g, '');
  
  // Build frontmatter
  const tags = post.categories.slice(1); // First is usually category, rest are tags
  const category = post.categories[0] || 'Uncategorized';
  
  const frontmatter = [
    '---',
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `pubDate: ${formatDate(post.pubDate)}`,
    `description: ""`,
    `author: "${post.creator || 'leebase'}"`,
    `tags: [${tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]`,
    `category: "${category.replace(/"/g, '\\"')}"`,
    `wordpress_url: "${post.link}"`,
    '---',
    '',
    markdownContent
  ].join('\n');
  
  await fs.writeFile(filepath, frontmatter, 'utf-8');
  console.log(`  ✅ Saved: ${filename}${imageMap.size > 0 ? ` (${imageMap.size} images)` : ''}`);
  
  return filename;
}

/**
 * Fetch all posts from RSS feeds
 */
async function fetchAllPosts() {
  const allPosts = [];
  let page = 1;
  let hasMore = true;
  
  console.log('📡 Fetching posts from RSS feed...\n');
  
  while (hasMore && page <= 100) {
    console.log(`Fetching page ${page}...`);
    
    try {
      const xml = await fetchWithRetry(`${RSS_URL}?paged=${page}`);
      const posts = parseRSS(xml);
      
      if (posts.length === 0) {
        hasMore = false;
        console.log(`  No more posts found at page ${page}`);
        break;
      }
      
      console.log(`  Found ${posts.length} posts`);
      allPosts.push(...posts);
      
      // Check if we've reached the oldest posts
      if (posts.length < 10) {
        hasMore = false;
      }
      
      page++;
      await sleep(REQUEST_DELAY);
    } catch (err) {
      console.error(`  ❌ Error fetching page ${page}: ${err.message}`);
      hasMore = false;
    }
  }
  
  return allPosts;
}

/**
 * Main function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   WordPress.com Scraper for Less of Lee');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Create output directories
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Images directory: ${IMAGES_DIR}\n`);
  
  // Fetch all posts
  const posts = await fetchAllPosts();
  totalPosts = posts.length;
  
  console.log(`\n📊 Found ${totalPosts} total posts\n`);
  
  // Process each post
  console.log('📝 Processing posts...\n');
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${totalPosts}] ${post.title.substring(0, 60)}${post.title.length > 60 ? '...' : ''}`);
    
    try {
      await createMarkdownFile(post, i);
    } catch (err) {
      console.error(`  ❌ Error processing post: ${err.message}`);
    }
    
    // Delay between posts
    if (i < posts.length - 1) {
      await sleep(500);
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   Scraper Complete!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Total posts: ${totalPosts}`);
  console.log(`Images downloaded: ${downloadedImages}`);
  console.log(`Images skipped (already exist): ${skippedImages}`);
  console.log(`Images failed: ${failedImages}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('═══════════════════════════════════════════════════');
}

// Run the scraper
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
