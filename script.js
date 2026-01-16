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
     */
    function selectEntry(entry) {
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
          showcase.setAttribute('data-selected', imageId);
        }
      }
    }
    
    // Add click handlers to all selectable entries
    selectableEntries.forEach(function(entry) {
      entry.addEventListener('click', function() {
        selectEntry(entry);
      });
      
      // Add keyboard support
      entry.setAttribute('tabindex', '0');
      entry.setAttribute('role', 'button');
      entry.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectEntry(entry);
        }
      });
    });
    
    // Set initial selection (ai-web is selected by default)
    const defaultEntry = document.querySelector('.entry.selectable.selected');
    if (defaultEntry && !isMobile()) {
      const imageId = defaultEntry.getAttribute('data-image');
      if (imageId) {
        showcase.setAttribute('data-selected', imageId);
      }
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
   * Handles window resize to update mobile/desktop behavior
   */
  function handleResize() {
    const modal = document.getElementById('mobileModal');
    
    // If resizing from mobile to desktop, close modal
    if (!isMobile() && modal && modal.classList.contains('active')) {
      closeMobileModal();
    }
  }

  // Initialize immediately to prevent flash of wrong theme
  init();
  
  // Initialize entry selection
  initEntrySelection();
  
  // Handle window resize
  window.addEventListener('resize', handleResize);
})();
