/**
 * Default Theme JavaScript
 * 
 * This file contains custom JavaScript for the default theme.
 * It's loaded dynamically when the theme is switched.
 */

console.log('🎨 Default theme JavaScript loaded');

// Theme namespace to avoid conflicts
window.DefaultTheme = window.DefaultTheme || {};

// Initialize theme functionality
window.DefaultTheme = {
  // Theme configuration
  name: 'Default',
  version: '1.0.0',
  
  // Initialize theme JavaScript
  init() {
    console.log('🚀 Initializing Default theme JavaScript');
    this.setupSmoothScrolling();
    this.setupMobileMenu();
    this.setupAnimations();
    this.setupFormEnhancements();
  },
  
  // Cleanup when theme is switched
  cleanup() {
    console.log('🧹 Cleaning up Default theme JavaScript');
    // Remove event listeners and cleanup
    document.removeEventListener('click', this.handleMobileMenuClick);
    // Remove any custom styles or elements added by JS
  },
  
  // Smooth scrolling for anchor links
  setupSmoothScrolling() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  },
  
  // Mobile menu functionality
  setupMobileMenu() {
    this.handleMobileMenuClick = (e) => {
      const menuButton = e.target.closest('[data-mobile-menu-button]');
      const menuOverlay = e.target.closest('[data-mobile-menu-overlay]');
      
      if (menuButton) {
        const menu = document.querySelector('[data-mobile-menu]');
        if (menu) {
          menu.classList.toggle('open');
          document.body.classList.toggle('menu-open');
        }
      }
      
      if (menuOverlay) {
        const menu = document.querySelector('[data-mobile-menu]');
        if (menu) {
          menu.classList.remove('open');
          document.body.classList.remove('menu-open');
        }
      }
    };
    
    document.addEventListener('click', this.handleMobileMenuClick);
  },
  
  // Setup scroll animations
  setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
    
    // Store observer for cleanup
    this.animationObserver = observer;
  },
  
  // Form enhancements
  setupFormEnhancements() {
    // Add floating labels
    document.querySelectorAll('input, textarea').forEach(input => {
      if (input.value) {
        input.classList.add('has-value');
      }
      
      input.addEventListener('input', () => {
        if (input.value) {
          input.classList.add('has-value');
        } else {
          input.classList.remove('has-value');
        }
      });
    });
    
    // Form validation enhancements
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
          } else {
            field.classList.remove('error');
          }
        });
        
        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  },
  
  // Utility functions
  utils: {
    // Debounce function
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Check if element is in viewport
    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },
    
    // Trigger custom event
    triggerEvent(element, eventName, data = {}) {
      const event = new CustomEvent(eventName, {
        detail: data,
        bubbles: true
      });
      element.dispatchEvent(event);
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.DefaultTheme.init();
  });
} else {
  window.DefaultTheme.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.DefaultTheme;
} 