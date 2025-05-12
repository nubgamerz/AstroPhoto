const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const IMAGE_DIR = path.join(__dirname, 'public', 'images');

// Serve processed and raw images statically
// Serve static files
app.use('/images', express.static(IMAGE_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load captures by scanning images directory
async function loadCaptures() {
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

// Middleware
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  // In a real application, you would process the form data here
  // For now, we'll just redirect back to the contact page
  console.log('Contact form submission:', req.body);
  res.redirect('/contact');
});

// API route to get all captures
app.get('/api/captures', async (req, res) => {
  const captures = await loadCaptures();
  res.json(captures);
});

// Main gallery route
app.get('/', async (req, res) => {
  // Initial load - we'll fetch data client-side for filtering
  const search = req.query.search || '';
  const sortField = req.query.sort || 'date';
  const order = req.query.order === 'asc' ? 'asc' : 'desc';
  
  // Just pass empty captures array - client will fetch data
  res.render('index', { 
    captures: [], 
    search: search, 
    sort: sortField, 
    order: order 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Astrophotography gallery listening on http://localhost:' + PORT);
});
