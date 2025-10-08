describe('Therapist Finder Application', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Wait for the page to load completely
    cy.get('app-header', { timeout: 10000 }).should('be.visible');
  });

  describe('Application Load', () => {
    it('should load the application successfully', () => {
      cy.get('app-header').should('be.visible');
      cy.get('app-filter-panel').should('be.visible');
      // Wait for content to load (either therapists or loading/error state)
      cy.get('body').should('contain.text', 'therapists found').or('contain.text', 'Loading').or('contain.text', 'No therapists found');
    });

    it('should display the correct page title', () => {
      cy.title().should('include', 'MindCare Pakistan');
    });

    it('should show loading state initially', () => {
      cy.visit('/');
      cy.get('.loading-state').should('be.visible');
    });
  });

  describe('Header and Navigation', () => {
    it('should display header with branding', () => {
      cy.get('.header').should('be.visible');
      cy.contains('MindCare Pakistan').should('be.visible');
      cy.get('.mind-icon').should('be.visible');
    });

    it('should have search input in header', () => {
      cy.get('input[placeholder*="Search"]').should('be.visible');
    });

    it('should be responsive on mobile', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.get('.mobile-header').should('be.visible');
      cy.get('.hamburger-menu').should('be.visible');
      cy.contains('MindCare').should('be.visible');
    });
  });

  describe('Filter Panel', () => {
    it('should display all filter sections', () => {
      cy.get('.filter-panel-container').should('be.visible');
      cy.contains('Cities').should('be.visible');
      cy.contains('Experience').should('be.visible');
      cy.contains('Gender').should('be.visible');
      cy.contains('Fee Range').should('be.visible');
      cy.contains('Consultation Mode').should('be.visible');
    });

    it('should show filter counts', () => {
      cy.get('.count').should('have.length.greaterThan', 0);
    });

    it('should allow city filtering', () => {
      cy.filterByCity('Karachi');
      cy.get('.results-count').should('contain', 'therapists found');
    });

    it('should allow gender filtering', () => {
      cy.filterByGender('Female');
      cy.get('.results-count').should('contain', 'therapists found');
    });

    it('should allow experience filtering', () => {
      cy.filterByExperience('0-5');
      cy.get('.results-count').should('contain', 'therapists found');
    });

    it('should allow fee range filtering', () => {
      cy.filterByFeeRange('2000-4000');
      cy.get('.results-count').should('contain', 'therapists found');
    });

    it('should allow consultation mode filtering', () => {
      cy.filterByMode('In-person');
      cy.get('.results-count').should('contain', 'therapists found');
    });

    it('should show active filter count', () => {
      cy.filterByCity('Karachi');
      cy.filterByGender('Female');
      cy.get('.filter-count').should('contain', 'filters active');
    });

    it('should clear all filters', () => {
      cy.filterByCity('Karachi');
      cy.filterByGender('Female');
      cy.clearAllFilters();
      cy.get('.filter-count').should('not.exist');
    });

    it('should be collapsible on mobile', () => {
      cy.viewport(375, 667);
      cy.get('.mobile-close-button').click();
      cy.get('.filter-panel-container').should('not.be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should search by therapist name', () => {
      cy.searchTherapists('Dr');
      cy.get('.results-count').should('contain', 'therapists found');
    });

    it('should search by expertise', () => {
      cy.searchTherapists('psychology');
      cy.get('.results-count').should('contain', 'therapists found');
    });

    it('should clear search', () => {
      cy.searchTherapists('test');
      cy.get('.clear-search-btn').click();
      cy.get('input[placeholder*="Search"]').should('have.value', '');
    });

    it('should have mobile search bar', () => {
      cy.viewport(375, 667);
      cy.get('.mobile-search-input').should('be.visible');
    });
  });

  describe('Therapist Cards', () => {
    it('should display therapist cards', () => {
      cy.get('app-therapist-card').should('have.length.greaterThan', 0);
    });

    it('should show therapist information', () => {
      cy.get('app-therapist-card').first().within(() => {
        cy.get('h3').should('be.visible');
        cy.get('.city').should('be.visible');
        cy.get('.experience').should('be.visible');
        cy.get('.fee').should('be.visible');
        cy.get('button').should('contain', 'View Details');
      });
    });

    it('should open therapist detail popup', () => {
      cy.get('app-therapist-card').first().find('button').click();
      cy.get('app-therapist-detail').should('be.visible');
      cy.get('.modal-content').should('be.visible');
    });

    it('should close therapist detail popup', () => {
      cy.get('app-therapist-card').first().find('button').click();
      cy.get('.close-button').click();
      cy.get('app-therapist-detail').should('not.be.visible');
    });

    it('should close popup when clicking outside', () => {
      cy.get('app-therapist-card').first().find('button').click();
      cy.get('.modal-overlay').click({ force: true });
      cy.get('app-therapist-detail').should('not.be.visible');
    });
  });

  describe('Therapist Detail Popup', () => {
    beforeEach(() => {
      cy.get('app-therapist-card').first().find('button').click();
    });

    it('should display therapist details', () => {
      cy.get('.modal-content').within(() => {
        cy.get('.name').should('be.visible');
        cy.get('.therapist-title').should('be.visible');
        cy.get('.city').should('be.visible');
        cy.contains('About').should('be.visible');
        cy.contains('Contact').should('be.visible');
      });
    });

    it('should have clickable phone link', () => {
      cy.get('a[href^="tel:"]').should('be.visible');
    });

    it('should have clickable email link', () => {
      cy.get('a[href^="mailto:"]').should('be.visible');
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      cy.get('.pagination-container').should('be.visible');
      cy.get('.pagination-info').should('be.visible');
    });

    it('should show page information', () => {
      cy.get('.pagination-info').should('contain', 'Showing');
      cy.get('.pagination-info').should('contain', 'of');
    });

    it('should navigate to next page', () => {
      cy.get('.pagination-btn').contains('Next').click();
      cy.waitForApi();
      cy.get('.pagination-info').should('contain', 'Showing');
    });

    it('should navigate to previous page', () => {
      // First go to page 2
      cy.get('.pagination-btn').contains('Next').click();
      cy.waitForApi();
      
      // Then go back to page 1
      cy.get('.pagination-btn').contains('Previous').click();
      cy.waitForApi();
      cy.get('.pagination-info').should('contain', 'Showing');
    });

    it('should show page numbers', () => {
      cy.get('.page-numbers').should('be.visible');
      cy.get('.page-number').should('have.length.greaterThan', 0);
    });

    it('should navigate to specific page', () => {
      cy.get('.page-number').first().click();
      cy.waitForApi();
      cy.get('.page-number.active').should('be.visible');
    });

    it('should have load more functionality', () => {
      cy.get('.load-more-btn').should('be.visible');
      cy.get('.load-more-btn').click();
      cy.waitForApi();
    });
  });

  describe('Combined Filtering', () => {
    it('should combine multiple filters', () => {
      cy.filterByCity('Karachi');
      cy.filterByGender('Female');
      cy.filterByExperience('0-5');
      cy.get('.filter-count').should('contain', 'filters active');
    });

    it('should combine filters with search', () => {
      cy.filterByCity('Karachi');
      cy.searchTherapists('psychology');
      cy.get('.filter-count').should('contain', 'filters active');
    });

    it('should show no results for impossible combinations', () => {
      cy.filterByCity('NonExistentCity');
      cy.get('.no-results').should('be.visible');
      cy.contains('No therapists found').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept and force an error
      cy.intercept('GET', '/api/therapists*', { statusCode: 500 }).as('getTherapistsError');
      cy.visit('/');
      cy.wait('@getTherapistsError');
      
      cy.get('.error-state').should('be.visible');
      cy.contains('Failed to load therapists').should('be.visible');
      cy.get('.retry-button').should('be.visible');
    });

    it('should retry on error', () => {
      // First cause an error
      cy.intercept('GET', '/api/therapists*', { statusCode: 500 }).as('getTherapistsError');
      cy.visit('/');
      cy.wait('@getTherapistsError');
      
      // Then allow success
      cy.intercept('GET', '/api/therapists*', { fixture: 'therapists.json' }).as('getTherapistsSuccess');
      cy.get('.retry-button').click();
      cy.wait('@getTherapistsSuccess');
      
      cy.get('app-therapist-card').should('be.visible');
    });
  });

  describe('Mobile Experience', () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE
    });

    it('should show mobile header', () => {
      cy.get('.mobile-header').should('be.visible');
      cy.get('.hamburger-menu').should('be.visible');
    });

    it('should toggle mobile menu', () => {
      cy.get('.hamburger-menu').click();
      cy.get('.filter-panel-container').should('be.visible');
      
      cy.get('.mobile-close-button').click();
      cy.get('.filter-panel-container').should('not.be.visible');
    });

    it('should show mobile search bar', () => {
      cy.get('.mobile-search-bar').should('be.visible');
      cy.get('.mobile-search-input').should('be.visible');
    });

    it('should show filter tag when filters are active', () => {
      cy.get('.hamburger-menu').click();
      cy.filterByCity('Karachi');
      cy.get('.mobile-filter-tag').should('be.visible');
      cy.contains('Filters Applied').should('be.visible');
    });

    it('should have mobile-optimized therapist cards', () => {
      cy.get('app-therapist-card').should('be.visible');
      cy.get('app-therapist-card').first().within(() => {
        cy.get('button').should('be.visible');
      });
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time', () => {
      const startTime = Date.now();
      cy.visit('/');
      cy.waitForApi();
      cy.get('app-therapist-card').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });
    });

    it('should handle large datasets efficiently', () => {
      cy.visit('/');
      cy.waitForApi();
      cy.get('app-therapist-card').should('have.length.greaterThan', 0);
      
      // Test pagination performance
      cy.get('.pagination-btn').contains('Next').click();
      cy.waitForApi();
      cy.get('app-therapist-card').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('button[aria-label]').should('have.length.greaterThan', 0);
    });

    it('should be keyboard navigable', () => {
      cy.get('input[placeholder*="Search"]').focus();
      cy.get('input[placeholder*="Search"]').type('test');
      cy.get('input[placeholder*="Search"]').should('have.value', 'test');
    });

    it('should have proper heading structure', () => {
      cy.get('h1, h2, h3, h4, h5, h6').should('have.length.greaterThan', 0);
    });
  });
});
