// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to wait for API calls to complete
       * @example cy.waitForApi()
       */
      waitForApi(): Chainable<void>;
      
      /**
       * Custom command to clear all filters
       * @example cy.clearAllFilters()
       */
      clearAllFilters(): Chainable<void>;
      
      /**
       * Custom command to search for therapists
       * @example cy.searchTherapists('psychology')
       */
      searchTherapists(searchTerm: string): Chainable<void>;
      
      /**
       * Custom command to apply city filter
       * @example cy.filterByCity('Karachi')
       */
      filterByCity(city: string): Chainable<void>;
      
      /**
       * Custom command to apply gender filter
       * @example cy.filterByGender('Female')
       */
      filterByGender(gender: string): Chainable<void>;
      
      /**
       * Custom command to apply experience filter
       * @example cy.filterByExperience('0-5')
       */
      filterByExperience(experience: string): Chainable<void>;
      
      /**
       * Custom command to apply fee range filter
       * @example cy.filterByFeeRange('2000-4000')
       */
      filterByFeeRange(feeRange: string): Chainable<void>;
      
      /**
       * Custom command to apply consultation mode filter
       * @example cy.filterByMode('In-person')
       */
      filterByMode(mode: string): Chainable<void>;
    }
  }
}

// Custom command to select by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

// Custom command to wait for API calls
Cypress.Commands.add('waitForApi', () => {
  // Set up intercepts for API calls
  cy.intercept('GET', '/api/therapists*').as('getTherapists');
  cy.intercept('GET', '/api/therapists/_filters/options').as('getFilterOptions');
  
  // Wait for the page to load and API calls to be made
  cy.get('app-therapist-card', { timeout: 15000 }).should('have.length.greaterThan', 0);
});

// Custom command to clear all filters
Cypress.Commands.add('clearAllFilters', () => {
  cy.get('.clear-filters-btn').click();
  cy.waitForApi();
});

// Custom command to search for therapists
Cypress.Commands.add('searchTherapists', (searchTerm: string) => {
  cy.get('input[placeholder*="Search"]').clear().type(searchTerm);
  cy.wait(500); // Wait for debounce
  cy.waitForApi();
});

// Custom command to filter by city
Cypress.Commands.add('filterByCity', (city: string) => {
  cy.get(`input[type="checkbox"][value="${city}"]`).check();
  cy.waitForApi();
});

// Custom command to filter by gender
Cypress.Commands.add('filterByGender', (gender: string) => {
  cy.get(`input[type="checkbox"][value="${gender}"]`).check();
  cy.waitForApi();
});

// Custom command to filter by experience
Cypress.Commands.add('filterByExperience', (experience: string) => {
  cy.get(`input[name="experience"][value="${experience}"]`).check();
  cy.waitForApi();
});

// Custom command to filter by fee range
Cypress.Commands.add('filterByFeeRange', (feeRange: string) => {
  cy.get(`input[name="feeRange"][value="${feeRange}"]`).check();
  cy.waitForApi();
});

// Custom command to filter by consultation mode
Cypress.Commands.add('filterByMode', (mode: string) => {
  cy.get(`input[type="checkbox"][value="${mode}"]`).check();
  cy.waitForApi();
});
