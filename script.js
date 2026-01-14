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

  // Initialize immediately to prevent flash of wrong theme
  init();
})();
