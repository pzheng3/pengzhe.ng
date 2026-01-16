/**
 * Peng - Product Designer Portfolio
 * Dark Mode Toggle with localStorage persistence and system preference support
 */

(function() {
  'use strict';

  /** @type {string} LocalStorage key for theme preference */
  const THEME_STORAGE_KEY = 'theme-preference';

  /** @type {string} Dark theme value */
  const THEME_DARK = 'dark';

  /** @type {string} Light theme value */
  const THEME_LIGHT = 'light';

  /**
   * Gets the user's preferred theme from system settings
   * @returns {string} 'dark' or 'light'
   */
  function getSystemThemePreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }
    return THEME_LIGHT;
  }

  /**
   * Gets the stored theme preference from localStorage
   * @returns {string|null} Stored theme or null if not set
   */
  function getStoredThemePreference() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
      // localStorage might be unavailable (private browsing, etc.)
      console.warn('Unable to access localStorage:', e);
      return null;
    }
  }

  /**
   * Saves theme preference to localStorage
   * @param {string} theme - The theme to save ('dark' or 'light')
   */
  function setStoredThemePreference(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Unable to save to localStorage:', e);
    }
  }

  /**
   * Gets the current effective theme
   * Priority: stored preference > system preference > light
   * @returns {string} 'dark' or 'light'
   */
  function getCurrentTheme() {
    const stored = getStoredThemePreference();
    if (stored) {
      return stored;
    }
    return getSystemThemePreference();
  }

  /**
   * Applies the theme to the document
   * @param {string} theme - The theme to apply ('dark' or 'light')
   */
  function applyTheme(theme) {
    if (theme === THEME_DARK) {
      document.documentElement.setAttribute('data-theme', THEME_DARK);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  /**
   * Toggles between light and dark themes
   * @returns {string} The new theme after toggling
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    // Add transitioning attribute to hide footer gradient during switch
    document.documentElement.setAttribute('data-theme-transitioning', '');
    
    applyTheme(newTheme);
    setStoredThemePreference(newTheme);
    
    // Remove transitioning attribute after transition completes
    setTimeout(function() {
      document.documentElement.removeAttribute('data-theme-transitioning');
    }, 300);
    
    return newTheme;
  }

  /**
   * Updates the toggle button's aria-label based on current theme
   * @param {HTMLElement} button - The toggle button element
   */
  function updateButtonLabel(button) {
    const isDark = document.documentElement.getAttribute('data-theme') === THEME_DARK;
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /**
   * Initializes the theme toggle functionality
   */
  function init() {
    // Apply initial theme (before DOM is fully loaded to prevent flash)
    const initialTheme = getCurrentTheme();
    applyTheme(initialTheme);

    // Wait for DOM to be ready before setting up the toggle button
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupToggleButton);
    } else {
      setupToggleButton();
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      darkModeQuery.addEventListener('change', function(e) {
        // Only auto-switch if user hasn't set a preference
        if (!getStoredThemePreference()) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
          
          const button = document.getElementById('themeToggle');
          if (button) {
            updateButtonLabel(button);
          }
        }
      });
    }
  }

  /**
   * Sets up the toggle button event listener
   */
  function setupToggleButton() {
    const toggleButton = document.getElementById('themeToggle');
    
    if (toggleButton) {
      // Set initial aria-label
      updateButtonLabel(toggleButton);
      
      // Add click handler
      toggleButton.addEventListener('click', function() {
        toggleTheme();
        updateButtonLabel(toggleButton);
      });

      // Add keyboard support (Enter and Space already work for buttons)
      toggleButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
          updateButtonLabel(toggleButton);
        }
      });
    }
  }

  /**
   * Checks if the device is mobile
   * @returns {boolean} True if mobile device
   */
  function isMobile() {
    return window.innerWidth <= 768;
  }

  /**
   * Opens the mobile modal with the selected image
   * @param {string} imageId - The image identifier
   */
  function openMobileModal(imageId) {
    const modal = document.getElementById('mobileModal');
    const mobileShowcase = document.querySelector('.mobile-showcase');
    
    if (!modal || !mobileShowcase) {
      return;
    }
    
    // Set the selected image
    if (imageId) {
      mobileShowcase.setAttribute('data-selected', imageId);
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Closes the mobile modal
   */
  function closeMobileModal() {
    const modal = document.getElementById('mobileModal');
    
    if (!modal) {
      return;
    }
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Updates image visibility with fade transition
   * @param {HTMLElement} showcase - The showcase element
   * @param {string} imageId - The image identifier to show
   * @param {boolean} [skipTransition=false] - Whether to skip fade transition
   */
  function updateImageVisibility(showcase, imageId, skipTransition) {
    if (!showcase || !imageId) return;
    
    const wrapper = showcase.querySelector('.showcase-image-wrapper');
    if (!wrapper) return;
    
    if (skipTransition) {
      // Update immediately without transition
      showcase.setAttribute('data-selected', imageId);
      return;
    }
    
    // Fade out
    wrapper.classList.add('fading');
    
    // Switch image halfway through fade out, so fade in overlaps with fade out
    setTimeout(function() {
      showcase.setAttribute('data-selected', imageId);
      wrapper.classList.remove('fading');
    }, 250);
  }

  /**
   * Starts the progress bar animation
   */
  function startProgressBar() {
    progressBar = document.getElementById('carouselProgress');
    if (!progressBar) return;
    
    const bar = progressBar.querySelector('.carousel-progress-bar');
    if (!bar) return;
    
    // Reset: remove running class and set width to 0
    progressBar.classList.remove('paused', 'running');
    bar.style.transition = 'none';
    bar.style.width = '0%';
    
    // Force reflow to apply the reset
    void bar.offsetWidth;
    
    // Start animation with delay to ensure transition triggers
    requestAnimationFrame(function() {
      bar.style.transition = 'width 10s linear';
      bar.style.width = '100%';
      progressBar.classList.add('running');
    });
  }

  /**
   * Pauses the progress bar animation
   */
  function pauseProgressBar() {
    if (!progressBar) {
      progressBar = document.getElementById('carouselProgress');
    }
    if (progressBar) {
      progressBar.classList.remove('running');
      progressBar.classList.add('paused');
    }
  }

  /**
   * Starts the auto-carousel for desktop
   * @param {NodeList} entries - List of selectable entries
   * @param {HTMLElement} showcase - The showcase element
   */
  function startCarousel(entries, showcase) {
    // Only start carousel on desktop and if not paused
    if (isMobile() || !entries || entries.length === 0 || !showcase || carouselPaused) {
      return;
    }
    
    // Clear any existing interval
    stopCarousel();
    
    // Start progress bar
    startProgressBar();
    
    carouselIntervalId = setInterval(function() {
      // Don't run on mobile or if paused
      if (isMobile() || carouselPaused) {
        stopCarousel();
        return;
      }
      
      // Find current selected index
      let currentIndex = -1;
      entries.forEach(function(entry, index) {
        if (entry.classList.contains('selected')) {
          currentIndex = index;
        }
      });
      
      // Calculate next index (loop back to 0 at the end)
      const nextIndex = (currentIndex + 1) % entries.length;
      const nextEntry = entries[nextIndex];
      
      // Select next entry
      entries.forEach(function(e) {
        e.classList.remove('selected');
      });
      nextEntry.classList.add('selected');
      
      const imageId = nextEntry.getAttribute('data-image');
      if (imageId) {
        updateImageVisibility(showcase, imageId);
      }
      
      // Restart progress bar for next cycle
      startProgressBar();
    }, CAROUSEL_INTERVAL);
  }

  /**
   * Stops the auto-carousel
   */
  function stopCarousel() {
    if (carouselIntervalId !== null) {
      clearInterval(carouselIntervalId);
      carouselIntervalId = null;
    }
  }

  /**
   * Pauses the auto-carousel (user interaction)
   */
  function pauseCarousel() {
    carouselPaused = true;
    stopCarousel();
    pauseProgressBar();
  }

  /**
   * Restarts the auto-carousel (used after user interaction)
   * @param {NodeList} entries - List of selectable entries
   * @param {HTMLElement} showcase - The showcase element
   */
  function restartCarousel(entries, showcase) {
    stopCarousel();
    startCarousel(entries, showcase);
  }

  /**
   * Handles entry selection and image switching
   */
  function setupEntrySelection() {
    const selectableEntries = document.querySelectorAll('.entry.selectable');
    const showcase = document.querySelector('.showcase');
    const modal = document.getElementById('mobileModal');
    
    if (!showcase) {
      return;
    }
    
    /**
     * Selects an entry and updates the showcase image
     * @param {HTMLElement} entry - The entry element to select
     * @param {boolean} [isUserAction=true] - Whether this is a user-triggered action
     */
    function selectEntry(entry, isUserAction) {
      if (isUserAction === undefined) {
        isUserAction = true;
      }
      
      // Get the image identifier from data attribute
      const imageId = entry.getAttribute('data-image');
      
      if (isMobile()) {
        // On mobile, open modal instead of highlighting
        if (imageId) {
          openMobileModal(imageId);
        }
      } else {
        // On desktop, highlight entry and show image in showcase
        // Remove selected class from all entries
        selectableEntries.forEach(function(e) {
          e.classList.remove('selected');
        });
        
        // Add selected class to clicked entry
        entry.classList.add('selected');
        
        if (imageId) {
          updateImageVisibility(showcase, imageId);
        }
        
        // Pause carousel on user interaction
        if (isUserAction) {
          pauseCarousel();
        }
      }
    }
    
    // Add click handlers to all selectable entries
    selectableEntries.forEach(function(entry) {
      entry.addEventListener('click', function() {
        selectEntry(entry, true);
      });
      
      // Add keyboard support
      entry.setAttribute('tabindex', '0');
      entry.setAttribute('role', 'button');
      entry.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectEntry(entry, true);
        }
      });
    });
    
    // Set initial selection (ai-web is selected by default)
    const defaultEntry = document.querySelector('.entry.selectable.selected');
    if (defaultEntry && !isMobile()) {
      const imageId = defaultEntry.getAttribute('data-image');
      if (imageId) {
        // Initialize image visibility without transition
        updateImageVisibility(showcase, imageId, true);
      }
    }
    
    // Start auto-carousel on desktop
    if (!isMobile()) {
      startCarousel(selectableEntries, showcase);
    }
    
    // Setup modal close handlers
    if (modal) {
      const underlay = modal.querySelector('.mobile-modal-underlay');
      const modalContent = modal.querySelector('.mobile-modal-content');
      
      // Close on underlay click
      if (underlay) {
        underlay.addEventListener('click', function() {
          closeMobileModal();
        });
      }
      
      // Close on click outside image wrapper (but inside modal content)
      if (modalContent) {
        modalContent.addEventListener('click', function(e) {
          const imageWrapper = modalContent.querySelector('.mobile-showcase-image-wrapper');
          // If click is not on the image wrapper or its children, close modal
          if (imageWrapper && !imageWrapper.contains(e.target)) {
            closeMobileModal();
          }
        });
      }
      
      // Prevent closing when clicking on the image wrapper or its children
      const imageWrapper = modal.querySelector('.mobile-showcase-image-wrapper');
      if (imageWrapper) {
        imageWrapper.addEventListener('click', function(e) {
          e.stopPropagation();
        });
      }
    }
  }

  /**
   * Initializes entry selection after DOM is ready
   */
  function initEntrySelection() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupEntrySelection);
    } else {
      setupEntrySelection();
    }
  }

  /**
   * Track previous mobile state for resize handling
   * @type {boolean}
   */
  let wasMobile = false;

  /**
   * Auto-carousel interval ID
   * @type {number|null}
   */
  let carouselIntervalId = null;

  /**
   * Auto-carousel interval duration in milliseconds
   * @type {number}
   */
  const CAROUSEL_INTERVAL = 10000;

  /**
   * Whether carousel is paused by user interaction
   * @type {boolean}
   */
  let carouselPaused = false;

  /**
   * Carousel progress bar element reference
   * @type {HTMLElement|null}
   */
  let progressBar = null;

  /**
   * Handles window resize to sync selection state between mobile and desktop
   */
  function handleResize() {
    const modal = document.getElementById('mobileModal');
    const showcase = document.querySelector('.showcase');
    const mobileShowcase = document.querySelector('.mobile-showcase');
    const selectableEntries = document.querySelectorAll('.entry.selectable');
    const nowMobile = isMobile();
    
    // Switching from mobile to desktop
    if (wasMobile && !nowMobile) {
      if (modal && modal.classList.contains('active')) {
        // Get the currently displayed image in modal
        const currentImageId = mobileShowcase ? mobileShowcase.getAttribute('data-selected') : null;
        
        // Close the modal
        closeMobileModal();
        
        // Find and select the corresponding entry on desktop
        if (currentImageId) {
          selectableEntries.forEach(function(entry) {
            entry.classList.remove('selected');
          });
          
          const correspondingEntry = document.querySelector('.entry.selectable[data-image="' + currentImageId + '"]');
          if (correspondingEntry) {
            correspondingEntry.classList.add('selected');
          }
          
          if (showcase) {
            updateImageVisibility(showcase, currentImageId, true);
          }
        }
      }
      
      // Reset carousel paused state and start carousel when switching to desktop
      carouselPaused = false;
      startCarousel(selectableEntries, showcase);
    }
    
    // Switching from desktop to mobile
    if (!wasMobile && nowMobile) {
      // Stop carousel when switching to mobile
      stopCarousel();
      pauseProgressBar();
      
      // Get the currently selected entry on desktop
      const selectedEntry = document.querySelector('.entry.selectable.selected');
      
      if (selectedEntry) {
        const currentImageId = selectedEntry.getAttribute('data-image');
        
        // Update mobile showcase with the same selection (but don't open modal)
        if (mobileShowcase && currentImageId) {
          mobileShowcase.setAttribute('data-selected', currentImageId);
        }
      }
    }
    
    wasMobile = nowMobile;
  }

  /**
   * Initialize resize tracking
   */
  function initResizeTracking() {
    wasMobile = isMobile();
    window.addEventListener('resize', handleResize);
  }

  // Initialize immediately to prevent flash of wrong theme
  init();
  
  // Initialize entry selection
  initEntrySelection();
  
  // Initialize resize tracking
  initResizeTracking();
})();
