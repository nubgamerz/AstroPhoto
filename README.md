# Astrophotography Gallery

A modern, responsive web application for showcasing astrophotography images with both raw and processed versions. Built with Node.js, Express, and EJS.

## Features

- **Automatic Image Discovery**: Automatically scans the filesystem for new images
- **Dual Image Display**: Shows both raw and processed versions of each capture
- **Metadata Support**: Displays title, description, location, date, and tags
- **Search Functionality**: Search by title, description, location, or tags
- **Sorting Options**: Sort by date, title, or location
- **Responsive Design**: Looks great on desktop and mobile devices
- **Modern UI**: Dark theme optimized for showcasing astrophotography

## Directory Structure

```
PhotoSite/
├── node_modules/
├── public/
│   ├── css/
│   │   └── style.css
│   └── images/
│       ├── YYYY-MM-DD/
│       │   └── capture-name/
│       │       ├── raw.jpg
│       │       ├── processed.jpg
│       │       └── metadata.json
│       └── ...
├── views/
│   ├── index.ejs
│   ├── about.ejs
│   └── contact.ejs
├── server.js
├── package.json
└── README.md
```

## Image Organization

Images are organized by date and capture name:

- Each capture should be in its own folder: `/public/images/YYYY-MM-DD/capture-name/`
- Each capture folder should contain:
  - `raw.jpg` or `raw.tiff`/`raw.tif`: The raw/unprocessed image
  - `processed.jpg` or `processed.tiff`/`processed.tif`: The processed/final image
  - `metadata.json`: Information about the capture

## Metadata Format

Each capture should include a `metadata.json` file with the following structure:

```json
{
  "title": "Orion Nebula",
  "description": "The Orion Nebula (M42) captured with a 10-inch telescope.",
  "tags": ["nebula", "orion", "messier", "m42"],
  "location": "Mauna Kea Observatory",
  "date": "2025-05-11"
}
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Access the site at: `http://localhost:3000`

## Adding New Images

1. Create a folder with the date format: `public/images/YYYY-MM-DD/`
2. Inside that folder, create a subfolder for your capture: `public/images/YYYY-MM-DD/capture-name/`
3. Add your raw image as `raw.jpg` or `raw.tiff`/`raw.tif`
4. Add your processed image as `processed.jpg` or `processed.tiff`/`processed.tif`
5. Create a `metadata.json` file with information about your capture
6. The image will automatically appear in the gallery on the next page load

## Deploying to Vercel

This project can be deployed to Vercel by following these steps:

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed: `npm install -g vercel`

### Deployment Steps

1. Login to Vercel:
   ```
   vercel login
   ```

2. Deploy your application with the "Other" framework preset:
   ```
   vercel --framework=other
   ```
   
   > **Important**: When prompted to select a framework preset during deployment, choose "Other" to ensure Vercel uses your custom configuration.

3. For production deployment:
   ```
   vercel --prod --framework=other
   ```

### Image Handling for Vercel Deployment

Since Vercel uses serverless functions with read-only filesystems, you have two options for handling images:

#### Option 1: Include Images in Repository

If your image collection is small enough (under Vercel's size limits), you can include them in your Git repository. They will be deployed with your code.

#### Option 2: Use External Storage (Recommended for Larger Collections)

For larger image collections, move your images to a service like AWS S3, Google Cloud Storage, or Cloudinary.

The project now includes a storage adapter in `utils/storage.js` that provides a consistent interface for accessing images, whether they're stored locally or on an external service.

To use external storage:

1. Upload your images to your chosen storage service
2. Implement the `getExternalCaptures()` function in `utils/storage.js` to fetch images from your storage service
3. Set the `STORAGE_TYPE` environment variable to `external` in your Vercel deployment

Example implementation for AWS S3:

```javascript
// In utils/storage.js
async function getExternalCaptures() {
  // Requires: npm install aws-sdk
  const AWS = require('aws-sdk');
  
  // Configure AWS SDK with your credentials
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  
  const s3 = new AWS.S3();
  const captures = [];
  
  try {
    // List all objects in your bucket
    const result = await s3.listObjects({ 
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: 'images/' 
    }).promise();
    
    // Process the objects and extract metadata
    // This is a simplified example - you'll need to adapt it to your storage structure
    for (const item of result.Contents) {
      // Example path: images/2025-05-09/lunar/metadata.json
      if (item.Key.endsWith('metadata.json')) {
        const parts = item.Key.split('/');
        if (parts.length >= 4) {
          const date = parts[1];
          const captureName = parts[2];
          
          // Get the metadata file
          const metadataResponse = await s3.getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: item.Key
          }).promise();
          
          const meta = JSON.parse(metadataResponse.Body.toString());
          
          // Construct URLs for the raw and processed images
          const rawUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/images/${date}/${captureName}/raw.jpg`;
          const processedUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/images/${date}/${captureName}/processed.jpg`;
          
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
    }
  } catch (err) {
    console.error('Error fetching images from S3:', err.message);
  }
  
  return captures;
}
```

### Environment Variables

Configure any environment variables your application needs in the Vercel dashboard after deployment.

## License

All rights reserved. This project is for personal use only.
