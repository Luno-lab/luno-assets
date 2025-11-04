#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '../assets');

// Statistics tracking
const stats = {
  totalFiles: 0,
  webpFiles: 0,
  nonWebpFiles: 0,
  directories: 0
};

async function verifyDirectory(dir, relativePath = '') {
  console.log(`Verifying directory: ${relativePath || 'assets'}`);
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const itemRelativePath = relativePath ? path.join(relativePath, item) : item;
    
    if (fs.statSync(itemPath).isDirectory()) {
      stats.directories++;
      await verifyDirectory(itemPath, itemRelativePath);
    } else {
      stats.totalFiles++;
      
      const ext = path.extname(item).toLowerCase();
      if (ext === '.webp') {
        stats.webpFiles++;
        
        // Verify if file is actually a valid WebP
        try {
          const metadata = await sharp(itemPath).metadata();
          if (metadata.format !== 'webp') {
            console.error(`⚠️  Warning: ${itemRelativePath} might not be a valid WebP file`);
          }
        } catch (error) {
          console.error(`❌ Error reading file ${itemRelativePath}: ${error.message}`);
        }
      } else {
        stats.nonWebpFiles++;
        console.error(`❌ Non-WebP file found: ${itemRelativePath}`);
      }
    }
  }
}

function printSummary() {
  console.log('\n=== Verification Summary ===');
  console.log(`Total directories: ${stats.directories}`);
  console.log(`Total files: ${stats.totalFiles}`);
  console.log(`WebP files: ${stats.webpFiles}`);
  console.log(`Non-WebP files: ${stats.nonWebpFiles}`);
  console.log('===========================');
  
  if (stats.nonWebpFiles > 0) {
    console.error('\n❌ Verification failed: Non-WebP files found in assets directory');
    process.exit(1);
  } else {
    console.log('\n✅ Verification successful: All files are in WebP format');
  }
}

async function main() {
  try {
    if (!fs.existsSync(assetsDir)) {
      console.error(`❌ Assets directory not found: ${assetsDir}`);
      process.exit(1);
    }
    
    await verifyDirectory(assetsDir);
    printSummary();
  } catch (error) {
    console.error(`\n❌ Error during verification: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`\n❌ Unhandled error: ${error.message}`);
  process.exit(1);
});