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
  const imageLoading = document.getElementById('image-loading');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalLocation = document.getElementById('modal-location');
  const modalDescription = document.getElementById('modal-description');
  const modalTags = document.getElementById('modal-tags');
  const modalClose = document.querySelector('.modal-close');
  const modalRawBtn = document.getElementById('modal-raw-btn');
  const modalProcessedBtn = document.getElementById('modal-processed-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomResetBtn = document.getElementById('zoom-reset-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const modalImageWrapper = document.querySelector('.modal-image-wrapper');
  const modalContent = document.querySelector('.modal-content');

  let currentRawUrl = '';
  let currentProcessedUrl = '';
  let currentScale = 1;
  let isDragging = false;
  let startX, startY, translateX = 0, translateY = 0;

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
      
      // Hide the image initially
      modalImage.style.display = 'none';
      
      // Show loading indicator
      if (imageLoading) imageLoading.style.display = 'flex';
      
      // Set image with loading handler
      modalImage.onload = function() {
        if (imageLoading) imageLoading.style.display = 'none';
        modalImage.style.display = 'block';
      };
      modalImage.onerror = function() {
        if (imageLoading) imageLoading.style.display = 'none';
        modalImage.style.display = 'block'; // Still show the image element even if it failed to load
      };
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
      
      // Reset zoom and position
      resetZoomAndPosition();
      
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

  // Zoom functionality
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
      currentScale += 0.25;
      if (currentScale > 3) currentScale = 3; // Limit max zoom
      updateImageTransform();
    });
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
      currentScale -= 0.25;
      if (currentScale < 1) currentScale = 1; // Don't zoom out smaller than original
      updateImageTransform();
    });
  }
  
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', function() {
      // Reset zoom and position
      currentScale = 1;
      translateX = 0;
      translateY = 0;
      updateImageTransform();
      modalImageWrapper.classList.remove('zoomed');
    });
  }
  
  // Pan functionality
  if (modalImageWrapper && modalImage) {
    // Mouse events for desktop
    modalImageWrapper.addEventListener('mousedown', function(e) {
      // Only handle direct clicks on the image or wrapper, not on buttons
      if (e.target === modalImage || e.target === modalImageWrapper) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalImageWrapper.classList.add('zoomed');
        e.preventDefault(); // Prevent any default behavior
      }
    });
    
    modalImageWrapper.addEventListener('mousemove', function(e) {
      if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateImageTransform();
        e.preventDefault(); // Prevent any default behavior
      }
    });
    
    modalImageWrapper.addEventListener('mouseup', function() {
      isDragging = false;
    });
    
    modalImageWrapper.addEventListener('mouseleave', function() {
      isDragging = false;
    });
    
    // Touch events for mobile
    modalImageWrapper.addEventListener('touchstart', function(e) {
      // Don't handle touch events on the zoom controls
      if (!e.target.closest('.modal-zoom-controls')) {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
        modalImageWrapper.classList.add('zoomed');
        // Don't prevent default here to allow tap events to work normally
      }
    });
    
    modalImageWrapper.addEventListener('touchmove', function(e) {
      if (isDragging) {
        e.preventDefault(); // Prevent scrolling while panning
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        updateImageTransform();
      }
    });
    
    modalImageWrapper.addEventListener('touchend', function() {
      isDragging = false;
    });
  }
  
  // Function to update image transform
  function updateImageTransform() {
    if (modalImage) {
      modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
  }
  
  // Fullscreen functionality removed
  
  // Reset zoom and position when modal is closed
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      currentScale = 1;
      translateX = 0;
      translateY = 0;
      updateImageTransform();
      modalImageWrapper.classList.remove('zoomed');
      
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
  }
  
  // Reset zoom and position when switching images
  function resetZoomAndPosition() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
    if (modalImageWrapper) modalImageWrapper.classList.remove('zoomed');
  }

  // Switch between raw and processed images
  if (modalRawBtn) {
    modalRawBtn.addEventListener('click', function() {
      // Reset zoom and position
      resetZoomAndPosition();
      
      // Hide the image initially
      modalImage.style.display = 'none';
      
      // Show loading indicator
      if (imageLoading) imageLoading.style.display = 'flex';
      
      // Set image with loading handler
      modalImage.onload = function() {
        if (imageLoading) imageLoading.style.display = 'none';
        modalImage.style.display = 'block';
      };
      modalImage.onerror = function() {
        if (imageLoading) imageLoading.style.display = 'none';
        modalImage.style.display = 'block'; // Still show the image element even if it failed to load
      };
      modalImage.src = currentRawUrl;
      
      modalRawBtn.classList.add('active');
      modalProcessedBtn.classList.remove('active');
    });
  }

  if (modalProcessedBtn) {
    modalProcessedBtn.addEventListener('click', function() {
      // Reset zoom and position
      resetZoomAndPosition();
      
      // Hide the image initially
      modalImage.style.display = 'none';
      
      // Show loading indicator
      if (imageLoading) imageLoading.style.display = 'flex';
      
      // Set image with loading handler
      modalImage.onload = function() {
        if (imageLoading) imageLoading.style.display = 'none';
        modalImage.style.display = 'block';
      };
      modalImage.onerror = function() {
        if (imageLoading) imageLoading.style.display = 'none';
        modalImage.style.display = 'block'; // Still show the image element even if it failed to load
      };
      modalImage.src = currentProcessedUrl;
      
      modalProcessedBtn.classList.add('active');
      modalRawBtn.classList.remove('active');
    });
  }
}
