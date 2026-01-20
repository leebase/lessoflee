/**
 * WordPress to Astro Conversion Script
 *
 * This script converts WordPress export XML to Astro-compatible Markdown.
 *
 * Usage:
 * 1. Export your WordPress content from wp-admin -> Tools -> Export -> Export All
 * 2. Save the XML file as 'wordpress-export.xml' in the project root
 * 3. Run: npm run convert
 *
 * The script will:
 * - Convert posts to Markdown files in src/content/blog/
 * - Download and save images to src/assets/posts/
 * - Fix frontmatter to match Astro's expected format
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const EXPORT_FILE = path.join(rootDir, 'wordpress-export.xml');
const TEMP_OUTPUT = path.join(rootDir, 'temp-wp-export');
const POSTS_OUTPUT = path.join(rootDir, 'src', 'content', 'blog');
const IMAGES_OUTPUT = path.join(rootDir, 'src', 'assets', 'posts');

async function main() {
  // Check if export file exists
  if (!fs.existsSync(EXPORT_FILE)) {
    console.error('❌ wordpress-export.xml not found in project root.');
    console.log('');
    console.log('To export your WordPress content:');
    console.log('1. Go to your WordPress dashboard');
    console.log('2. Navigate to Tools → Export');
    console.log('3. Select "All content" and click "Download Export File"');
    console.log('4. Save the file as "wordpress-export.xml" in this project folder');
    process.exit(1);
  }

  console.log('📥 Found wordpress-export.xml');

  // Create temp output directory
  if (fs.existsSync(TEMP_OUTPUT)) {
    fs.rmSync(TEMP_OUTPUT, { recursive: true });
  }
  fs.mkdirSync(TEMP_OUTPUT, { recursive: true });

  // Ensure output directories exist
  fs.mkdirSync(POSTS_OUTPUT, { recursive: true });
  fs.mkdirSync(IMAGES_OUTPUT, { recursive: true });

  console.log('🔄 Converting WordPress export to Markdown...');

  try {
    // Run wordpress-export-to-markdown
    execSync(`npx wordpress-export-to-markdown --input "${EXPORT_FILE}" --output "${TEMP_OUTPUT}" --post-folders false --save-images true --year-folders true`, {
      stdio: 'inherit',
      cwd: rootDir
    });
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Initial conversion complete');
  console.log('🔧 Processing converted files...');

  // Process the converted files
  processConvertedFiles(TEMP_OUTPUT);

  // Cleanup temp directory
  fs.rmSync(TEMP_OUTPUT, { recursive: true });

  console.log('');
  console.log('✅ WordPress conversion complete!');
  console.log(`   Posts saved to: ${POSTS_OUTPUT}`);
  console.log(`   Images saved to: ${IMAGES_OUTPUT}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review a few posts to ensure formatting looks correct');
  console.log('2. Run "npm run dev" to preview your site');
  console.log('3. Run "npm run build" to build for production');
}

function processConvertedFiles(tempDir) {
  const items = fs.readdirSync(tempDir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(tempDir, item.name);

    if (item.isDirectory()) {
      // Check if it's a year folder or contains posts
      processConvertedFiles(fullPath);
    } else if (item.name.endsWith('.md')) {
      processMarkdownFile(fullPath);
    } else if (isImageFile(item.name)) {
      // Copy image to assets folder
      const destPath = path.join(IMAGES_OUTPUT, item.name);
      fs.copyFileSync(fullPath, destPath);
    }
  }
}

function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

function processMarkdownFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.warn(`⚠️ No frontmatter found in ${filePath}`);
    return;
  }

  const frontmatterText = frontmatterMatch[1];
  const bodyContent = content.slice(frontmatterMatch[0].length).trim();

  // Parse frontmatter fields
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  let currentKey = null;

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      frontmatter[currentKey] = match[2].replace(/^["']|["']$/g, '');
    } else if (currentKey && line.startsWith('  ')) {
      // Multi-line value
      frontmatter[currentKey] += '\n' + line.trim();
    }
  }

  // Build new Astro-compatible frontmatter
  const newFrontmatter = {
    title: frontmatter.title || 'Untitled',
    description: frontmatter.description || frontmatter.excerpt || extractExcerpt(bodyContent),
    pubDate: formatDate(frontmatter.date || frontmatter.pubDate),
  };

  // Handle featured image if present
  if (frontmatter.coverImage || frontmatter.featured_image) {
    const imageName = path.basename(frontmatter.coverImage || frontmatter.featured_image);
    newFrontmatter.heroImage = `../../assets/posts/${imageName}`;
  }

  // Generate slug from filename
  const filename = path.basename(filePath, '.md');
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');

  // Fix image paths in content
  let processedBody = bodyContent
    // Fix relative image paths to point to assets
    .replace(/!\[([^\]]*)\]\((?:\.\/)?images\/([^)]+)\)/g, '![$1](../../assets/posts/$2)')
    // Fix WordPress figure/figcaption shortcodes
    .replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gs, '$1')
    // Clean up any remaining WordPress shortcodes
    .replace(/\[[^\]]+\]/g, '');

  // Build new content
  const newContent = `---
title: '${escapeYaml(newFrontmatter.title)}'
description: '${escapeYaml(newFrontmatter.description)}'
pubDate: '${newFrontmatter.pubDate}'${newFrontmatter.heroImage ? `\nheroImage: '${newFrontmatter.heroImage}'` : ''}
---

${processedBody}
`;

  // Save to final location
  const destPath = path.join(POSTS_OUTPUT, `${slug}.md`);
  fs.writeFileSync(destPath, newContent);
  console.log(`   ✓ ${slug}.md`);
}

function extractExcerpt(content, maxLength = 160) {
  // Remove markdown formatting and get first paragraph
  const text = content
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .trim();

  const firstParagraph = text.split('\n\n')[0] || text;

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  return firstParagraph.slice(0, maxLength - 3) + '...';
}

function formatDate(dateStr) {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0];
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function escapeYaml(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

main().catch(console.error);
