/**
 * Storage adapter for PhotoSite
 * 
 * This module provides a consistent interface for accessing images,
 * whether they're stored locally or on an external service.
 * 
 * For local development, it uses the filesystem.
 * For production on Vercel, it can be configured to use external storage.
 */

const path = require('path');
const fs = require('fs').promises;

// Default to local filesystem storage
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images');

/**
 * Get all captures from storage
 * @returns {Promise<Array>} Array of capture objects
 */
async function getCaptures() {
  if (STORAGE_TYPE === 'local') {
    return getLocalCaptures();
  } else if (STORAGE_TYPE === 'external') {
    return getExternalCaptures();
  } else {
    throw new Error(`Unknown storage type: ${STORAGE_TYPE}`);
  }
}

/**
 * Get captures from local filesystem
 * @returns {Promise<Array>} Array of capture objects
 */
async function getLocalCaptures() {
  const captures = [];
  try {
    const dateDirs = await fs.readdir(IMAGE_DIR, { withFileTypes: true });
    for (const dateDir of dateDirs.filter(d => d.isDirectory())) {
      const date = dateDir.name;
      const datePath = path.join(IMAGE_DIR, date);
      const captureDirs = await fs.readdir(datePath, { withFileTypes: true });
      for (const capDir of captureDirs.filter(d => d.isDirectory())) {
        const captureName = capDir.name;
        const capPath = path.join(datePath, captureName);
        const metaFile = path.join(capPath, 'metadata.json');
        let meta = {};
        try {
          meta = JSON.parse(await fs.readFile(metaFile, 'utf-8'));
        } catch (err) {
          console.warn('Warning: could not read metadata for ' + captureName + ': ', err.message);
        }
        // Check for raw image (jpg or tiff)
        let rawUrl = '/images/' + date + '/' + captureName + '/raw.jpg';
        try {
          await fs.access(path.join(IMAGE_DIR, date, captureName, 'raw.tiff'));
          rawUrl = '/images/' + date + '/' + captureName + '/raw.tiff';
        } catch (err) {
          try {
            await fs.access(path.join(IMAGE_DIR, date, captureName, 'raw.tif'));
            rawUrl = '/images/' + date + '/' + captureName + '/raw.tif';
          } catch (err) {
            // Stick with jpg as default
          }
        }
        
        // Check for processed image (jpg or tiff)
        let processedUrl = '/images/' + date + '/' + captureName + '/processed.jpg';
        try {
          await fs.access(path.join(IMAGE_DIR, date, captureName, 'processed.tiff'));
          processedUrl = '/images/' + date + '/' + captureName + '/processed.tiff';
        } catch (err) {
          try {
            await fs.access(path.join(IMAGE_DIR, date, captureName, 'processed.tif'));
            processedUrl = '/images/' + date + '/' + captureName + '/processed.tif';
          } catch (err) {
            // Stick with jpg as default
          }
        }
        captures.push({
          id: date + '/' + captureName,
          date: date,
          rawUrl: rawUrl,
          processedUrl: processedUrl,
          title: meta.title || '',
          description: meta.description || '',
          tags: meta.tags || [],
          location: meta.location || ''
        });
      }
    }
  } catch (err) {
    console.error('Error scanning images directory:', err.message);
  }
  return captures;
}

/**
 * Get captures from external storage (e.g., S3, Cloudinary)
 * @returns {Promise<Array>} Array of capture objects
 */
async function getExternalCaptures() {
  // This is a placeholder for external storage implementation
  // Replace this with actual code to fetch from your external storage service
  console.log('Using external storage (placeholder implementation)');
  
  // Example implementation (replace with actual code):
  // const s3 = new AWS.S3();
  // const result = await s3.listObjects({ Bucket: 'your-bucket' }).promise();
  // const captures = result.Contents.map(item => { ... });
  
  // For now, return an empty array
  return [];
}

module.exports = {
  getCaptures
};
