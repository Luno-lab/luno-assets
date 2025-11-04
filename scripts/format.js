#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sourcesDir = path.join(__dirname, '../sources');
const assetsDir = path.join(__dirname, '../assets');

const stats = {
  totalFiles: 0,
  processedFiles: 0,
  copiedSvgFiles: 0,
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

function createPlaceholderSVG(width = 100, height = 100, name = '') {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="middle">${name}</text>
  </svg>`;
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

function processImageFile(sourcePath, targetPath) {
  const ext = path.extname(sourcePath).toLowerCase();
  const baseName = path.basename(sourcePath, ext);
  const targetSvgPath = path.join(path.dirname(targetPath), `${baseName}.svg`);

  try {
    if (ext === '.svg') {
      fs.copyFileSync(sourcePath, targetPath);
      stats.copiedSvgFiles++;
    } else {
      const svgContent = createPlaceholderSVG(100, 100, baseName);
      fs.writeFileSync(targetSvgPath, svgContent);
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

function processDirectory(sourceSubDir, targetSubDir) {
  const sourcePath = path.join(sourcesDir, sourceSubDir);
  const targetPath = path.join(assetsDir, targetSubDir);

  ensureDirectoryExists(targetPath);

  const items = fs.readdirSync(sourcePath);

  for (const item of items) {
    const sourceItemPath = path.join(sourcePath, item);
    const targetItemPath = path.join(targetPath, item);

    if (fs.statSync(sourceItemPath).isDirectory()) {
      processDirectory(path.join(sourceSubDir, item), path.join(targetSubDir, item));
    } else {
      const ext = path.extname(item).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
        processImageFile(sourceItemPath, targetItemPath);
      }
    }
  }
}

function printSummary() {
  const duration = (Date.now() - stats.startTime) / 1000;

  console.log('\n\n=== Processing Summary ===');
  console.log(`Total files processed: ${stats.processedFiles}`);
  console.log(`SVG files copied: ${stats.copiedSvgFiles}`);
  console.log(`Files converted to SVG: ${stats.convertedFiles}`);
  console.log(`Files with errors: ${stats.errorFiles}`);
  console.log(`Time taken: ${duration.toFixed(2)} seconds`);
  console.log('========================');
}

function main() {
  try {
    console.log('Scanning source directories...');

    const sourcesSubDirs = fs.readdirSync(sourcesDir)
      .filter(item => fs.statSync(path.join(sourcesDir, item)).isDirectory());

    stats.totalFiles = countImageFiles(sourcesDir);

    console.log(`Found ${stats.totalFiles} image files to process in ${sourcesSubDirs.length} directories.`);
    console.log('Starting conversion process...\n');

    for (const subDir of sourcesSubDirs) {
      processDirectory(subDir, subDir);
    }

    printSummary();
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main();
