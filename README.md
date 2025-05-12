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

## License

All rights reserved. This project is for personal use only.
