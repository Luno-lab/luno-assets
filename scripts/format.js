#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourcesDir = path.join(__dirname, '../sources');
const assetsDir = path.join(__dirname, '../assets');

const stats = {
  totalFiles: 0,
  processedFiles: 0,
  copiedWebpFiles: 0,
  convertedFiles: 0,
  errorFiles: 0,
  startTime: Date.now()
};

const progressBarLength = 30;

function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function updateProgressBar() {
  const progress = stats.processedFiles / stats.totalFiles;
  const filledLength = Math.floor(progressBarLength * progress);
  const emptyLength = progressBarLength - filledLength;

  const filled = '='.repeat(filledLength);
  const empty = ' '.repeat(emptyLength);
  const percentage = Math.floor(progress * 100);

  process.stdout.write(`\r[${filled}>${empty}] ${percentage}% | ${stats.processedFiles}/${stats.totalFiles} files`);
}

async function processImageFile(sourcePath, targetPath) {
  const ext = path.extname(sourcePath).toLowerCase();
  const baseName = path.basename(sourcePath, ext);
  const targetWebpPath = path.join(path.dirname(targetPath), `${baseName}.webp`);

  try {
    if (ext === '.webp') {
      // If already webp, just copy it
      fs.copyFileSync(sourcePath, targetPath);
      stats.copiedWebpFiles++;
    } else {
      // Convert to webp with high quality
      await sharp(sourcePath)
        .webp({
          quality: 95,         // High quality (0-100)
          lossless: false,     // Use lossy compression for smaller files
          effort: 6,           // Compression effort (0-6), higher = better compression but slower
          smartSubsample: true // Better chroma subsampling
        })
        .toFile(targetWebpPath);
      stats.convertedFiles++;
    }

    stats.processedFiles++;
    updateProgressBar();
  } catch (error) {
    stats.errorFiles++;
    stats.processedFiles++;
    updateProgressBar();
    console.error(`\nError processing ${sourcePath}: ${error.message}`);
  }
}

function countImageFiles(directory) {
  let count = 0;

  function traverseDir(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);

      if (fs.statSync(itemPath).isDirectory()) {
        traverseDir(itemPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
          count++;
        }
      }
    }
  }

  traverseDir(directory);
  return count;
}

async function processDirectory(sourceSubDir, targetSubDir) {
  const sourcePath = path.join(sourcesDir, sourceSubDir);
  const targetPath = path.join(assetsDir, targetSubDir);

  ensureDirectoryExists(targetPath);

  const items = fs.readdirSync(sourcePath);

  for (const item of items) {
    const sourceItemPath = path.join(sourcePath, item);
    const targetItemPath = path.join(targetPath, item);

    if (fs.statSync(sourceItemPath).isDirectory()) {
      await processDirectory(path.join(sourceSubDir, item), path.join(targetSubDir, item));
    } else {
      const ext = path.extname(item).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
        await processImageFile(sourceItemPath, targetItemPath);
      }
    }
  }
}

function printSummary() {
  const duration = (Date.now() - stats.startTime) / 1000;

  console.log('\n\n=== Processing Summary ===');
  console.log(`Total files processed: ${stats.processedFiles}`);
  console.log(`WebP files copied: ${stats.copiedWebpFiles}`);
  console.log(`Files converted to WebP: ${stats.convertedFiles}`);
  console.log(`Files with errors: ${stats.errorFiles}`);
  console.log(`Time taken: ${duration.toFixed(2)} seconds`);
  console.log('========================');
}

async function main() {
  try {
    console.log('Scanning source directories...');

    const sourcesSubDirs = fs.readdirSync(sourcesDir)
      .filter(item => fs.statSync(path.join(sourcesDir, item)).isDirectory());

    stats.totalFiles = countImageFiles(sourcesDir);

    console.log(`Found ${stats.totalFiles} image files to process in ${sourcesSubDirs.length} directories.`);
    console.log('Starting conversion process...\n');

    for (const subDir of sourcesSubDirs) {
      await processDirectory(subDir, subDir);
    }

    printSummary();
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`\nUnhandled error: ${error.message}`);
  process.exit(1);
});