const express = require('express');
const path = require('path');
const storage = require('./utils/storage');

const app = express();
const IMAGE_DIR = path.join(__dirname, 'public', 'images');

// Determine if we're running in Vercel
const isVercel = process.env.VERCEL === '1';

// Serve processed and raw images statically
// Serve static files
app.use('/images', express.static(IMAGE_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Add a health check route for Vercel
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

// Load captures using the storage adapter
async function loadCaptures() {
  return storage.getCaptures();
}

// Middleware
app.use(express.urlencoded({ extended: true }));

// Routes

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

// Start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('We Capture Space listening on http://localhost:' + PORT);
  });
}

// Export the app for Vercel
module.exports = app;
