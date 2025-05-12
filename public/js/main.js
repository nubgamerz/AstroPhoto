document.addEventListener('DOMContentLoaded', function() {
  // Fix for Font Awesome icons that don't exist
  const galaxyIcon = document.querySelector('.fa-galaxy');
  if (galaxyIcon) {
    galaxyIcon.classList.remove('fa-galaxy');
    galaxyIcon.classList.add('fa-star');
  }
  
  const telescopeIcon = document.querySelector('.fa-telescope');
  if (telescopeIcon) {
    telescopeIcon.classList.remove('fa-telescope');
    telescopeIcon.classList.add('fa-binoculars');
  }

  // Note: Live search functionality moved to gallery.js

  // Modal functionality
  setupImageModal();
});

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

// Setup modal for image viewing
function setupImageModal() {
  const modal = document.getElementById('image-modal');
  if (!modal) return;

  const captureCards = document.querySelectorAll('.capture-card');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalLocation = document.getElementById('modal-location');
  const modalDescription = document.getElementById('modal-description');
  const modalTags = document.getElementById('modal-tags');
  const modalClose = document.querySelector('.modal-close');
  const modalRawBtn = document.getElementById('modal-raw-btn');
  const modalProcessedBtn = document.getElementById('modal-processed-btn');

  let currentRawUrl = '';
  let currentProcessedUrl = '';

  // Open modal when clicking on a capture card
  captureCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't open modal if clicking on the view buttons
      if (e.target.closest('.view-buttons')) return;
      
      // Get data from the card
      const title = card.querySelector('.card-title').textContent;
      const dateElement = card.querySelector('.card-meta span:nth-child(1)');
      const exposureTimeElement = card.querySelector('.card-meta span:nth-child(2)');
      const locationElement = card.querySelector('.card-meta span:nth-child(3)');
      const focalLengthElement = card.querySelector('.card-meta:nth-child(3) span:nth-child(1)');
      const pixelSizeElement = card.querySelector('.card-meta:nth-child(3) span:nth-child(2)');
      
      // Extract text content, removing only the icon part
      const date = dateElement ? dateElement.textContent.replace(/^\S+\s+/, '') : '';
      const exposureTime = exposureTimeElement ? exposureTimeElement.textContent.replace(/^\S+\s+/, '') : '';
      const location = locationElement ? locationElement.textContent.replace(/^\S+\s+/, '') : '';
      const focalLength = focalLengthElement ? focalLengthElement.textContent.replace(/^\S+\s+/, '') : '';
      const pixelSize = pixelSizeElement ? pixelSizeElement.textContent.replace(/^\S+\s+/, '') : '';
      const description = card.querySelector('.card-description')?.textContent || '';
      
      // Get image URLs from data attributes
      const processedUrl = card.dataset.processed || card.querySelector('.card-image img').src;
      const rawUrl = card.dataset.raw || '';
      
      // Get tags
      const tags = [];
      card.querySelectorAll('.card-tags li').forEach(tag => {
        tags.push(tag.textContent);
      });
      
      // Update modal content
      modalTitle.textContent = title;
      modalDate.textContent = date;
      document.getElementById('modal-exposure-time').textContent = exposureTime;
      modalLocation.textContent = location;
      document.getElementById('modal-focal-length').textContent = focalLength;
      document.getElementById('modal-pixel-size').textContent = pixelSize;
      modalDescription.textContent = description;
      
      // Set image
      modalImage.src = processedUrl;
      currentRawUrl = rawUrl;
      currentProcessedUrl = processedUrl;
      
      // Update tags
      modalTags.innerHTML = '';
      tags.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        modalTags.appendChild(li);
      });
      
      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
  });

  // Close modal when clicking the close button
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
  }

  // Close modal when clicking outside the content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
  });

  // Switch between raw and processed images
  if (modalRawBtn) {
    modalRawBtn.addEventListener('click', function() {
      modalImage.src = currentRawUrl;
      modalRawBtn.classList.add('active');
      modalProcessedBtn.classList.remove('active');
    });
  }

  if (modalProcessedBtn) {
    modalProcessedBtn.addEventListener('click', function() {
      modalImage.src = currentProcessedUrl;
      modalProcessedBtn.classList.add('active');
      modalRawBtn.classList.remove('active');
    });
  }
}
