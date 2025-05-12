/**
 * Gallery functionality for Cosmic Captures
 * Handles client-side filtering, sorting, and display of astrophotography images
 */

// Store all captures data for client-side filtering
let allCaptures = [];
let filteredCaptures = [];
let currentSort = 'date';
let currentOrder = 'desc';

// DOM elements
const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('input[name="search"]');
const sortSelect = document.querySelector('select[name="sort"]');
const orderSelect = document.querySelector('select[name="order"]');
const searchButton = document.querySelector('.search-button');
const searchForm = document.querySelector('.search-form');

// Initialize the gallery
document.addEventListener('DOMContentLoaded', function() {
  // Fetch all captures data
  fetchCaptures();
  
  // Set up event listeners
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      filterCaptures();
    }, 300));
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentSort = this.value;
      filterCaptures();
    });
  }
  
  if (orderSelect) {
    orderSelect.addEventListener('change', function() {
      currentOrder = this.value;
      filterCaptures();
    });
  }
  
  // Prevent form submission since we're handling filtering client-side
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      filterCaptures();
    });
  }
});

// Fetch all captures data from the server
function fetchCaptures() {
  fetch('/api/captures')
    .then(response => response.json())
    .then(data => {
      allCaptures = data;
      filteredCaptures = [...allCaptures];
      renderGallery();
    })
    .catch(error => {
      console.error('Error fetching captures:', error);
    });
}

// Filter captures based on search input
function filterCaptures() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  
  if (searchTerm === '') {
    filteredCaptures = [...allCaptures];
  } else {
    filteredCaptures = allCaptures.filter(capture => {
      return (
        (capture.title && capture.title.toLowerCase().includes(searchTerm)) ||
        (capture.description && capture.description.toLowerCase().includes(searchTerm)) ||
        (capture.location && capture.location.toLowerCase().includes(searchTerm)) ||
        (capture.tags && capture.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    });
  }
  
  sortCaptures();
  renderGallery();
}

// Sort captures based on current sort and order
function sortCaptures() {
  filteredCaptures.sort((a, b) => {
    let aVal, bVal;
    
    if (currentSort === 'title') {
      aVal = a.title || '';
      bVal = b.title || '';
    } else if (currentSort === 'location') {
      aVal = a.location || '';
      bVal = b.location || '';
    } else {
      // Default to date
      aVal = a.date;
      bVal = b.date;
    }
    
    if (aVal < bVal) return currentOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return currentOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

// Render the gallery with filtered and sorted captures
function renderGallery() {
  if (!gallery) return;
  
  if (filteredCaptures.length === 0) {
    gallery.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-satellite"></i>
        <h2>No images found</h2>
        <p>No images match your search criteria.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  filteredCaptures.forEach(cap => {
    let tagsHtml = '';
    if (cap.tags && cap.tags.length) {
      tagsHtml = '<ul class="card-tags">';
      cap.tags.forEach(tag => {
        tagsHtml += `<li>${tag}</li>`;
      });
      tagsHtml += '</ul>';
    }
    
    html += `
      <div class="capture-card" data-raw="${cap.rawUrl}" data-processed="${cap.processedUrl}">
        <div class="card-image">
          <img src="${cap.processedUrl}" alt="${cap.title || 'Astrophotography image'}">
        </div>
        <div class="card-content">
          <h2 class="card-title">${cap.title || 'Untitled Capture'}</h2>
          <div class="card-meta">
            <span><i class="far fa-calendar"></i> ${cap.date}</span>
            <span><i class="fas fa-clock"></i> ${cap.exposureTime || 'Unknown exposure'}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${cap.location || 'Unknown location'}</span>
          </div>
          <div class="card-meta">
            <span><i class="fas fa-camera"></i> ${cap.focalLength || 'Unknown focal length'}</span>
            <span><i class="fas fa-microchip"></i> ${cap.pixelSize || 'Unknown pixel size'}</span>
          </div>
          ${cap.description ? `<p class="card-description">${cap.description}</p>` : ''}
          ${tagsHtml}
        </div>
      </div>
    `;
  });
  
  gallery.innerHTML = html;
  
  // Re-attach event listeners to the newly created cards
  setupImageModal();
}

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}
