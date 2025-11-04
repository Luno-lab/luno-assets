#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// Statistics tracking
const stats = {
  totalFiles: 0,
  svgFiles: 0,
  nonSvgFiles: 0,
  directories: 0
};

function verifyDirectory(dir, relativePath = '') {
  console.log(`Verifying directory: ${relativePath || 'assets'}`);
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const itemRelativePath = relativePath ? path.join(relativePath, item) : item;
    
    if (fs.statSync(itemPath).isDirectory()) {
      stats.directories++;
      verifyDirectory(itemPath, itemRelativePath);
    } else {
      stats.totalFiles++;
      
      const ext = path.extname(item).toLowerCase();
      if (ext === '.svg') {
        stats.svgFiles++;
        
        // Verify if file is actually a valid SVG
        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          if (!content.includes('<svg') || !content.includes('</svg>')) {
            console.error(`⚠️  Warning: ${itemRelativePath} might not be a valid SVG file`);
          }
        } catch (error) {
          console.error(`❌ Error reading file ${itemRelativePath}: ${error.message}`);
        }
      } else {
        stats.nonSvgFiles++;
        console.error(`❌ Non-SVG file found: ${itemRelativePath}`);
      }
    }
  }
}

function printSummary() {
  console.log('\n=== Verification Summary ===');
  console.log(`Total directories: ${stats.directories}`);
  console.log(`Total files: ${stats.totalFiles}`);
  console.log(`SVG files: ${stats.svgFiles}`);
  console.log(`Non-SVG files: ${stats.nonSvgFiles}`);
  console.log('===========================');
  
  if (stats.nonSvgFiles > 0) {
    console.error('\n❌ Verification failed: Non-SVG files found in assets directory');
    process.exit(1);
  } else {
    console.log('\n✅ Verification successful: All files are in SVG format');
  }
}

function main() {
  try {
    if (!fs.existsSync(assetsDir)) {
      console.error(`❌ Assets directory not found: ${assetsDir}`);
      process.exit(1);
    }
    
    verifyDirectory(assetsDir);
    printSummary();
  } catch (error) {
    console.error(`\n❌ Error during verification: ${error.message}`);
    process.exit(1);
  }
}

main();
