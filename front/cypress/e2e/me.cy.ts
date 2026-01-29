describe('User account (Me) spec', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    
    // Mock user detail API
    cy.intercept('GET', '/api/user/1', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'yoga@studio.com',
        lastName: 'Admin',
        firstName: 'Admin',
        admin: true,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-15T00:00:00'
      }
    }).as('userDetail');
    
    cy.contains('Account').click();
    cy.url().should('include', '/me');
  });

  it('should display user information', () => {
    cy.get('p').should('contain', 'Name:');
    cy.get('p').should('contain', 'Email:');
  });

  it('should display admin badge', () => {
    cy.contains('You are admin').should('be.visible');
  });

  it('should display creation date', () => {
    cy.contains('Create at:').should('be.visible');
  });

  it('should display last update date', () => {
    cy.contains('Last update:').should('be.visible');
  });

  it('should have back button', () => {
    cy.get('button[mat-icon-button]').should('exist');
  });

  it('should navigate back to sessions', () => {
    cy.get('button[mat-icon-button]').first().click();
    cy.url().should('include', '/sessions');
  });
});

describe('User account as regular user', () => {
  beforeEach(() => {
    cy.loginAsUser();
    
    // Mock user detail API for regular user
    cy.intercept('GET', '/api/user/2', {
      statusCode: 200,
      body: {
        id: 2,
        email: 'test@test.com',
        lastName: 'User',
        firstName: 'Test',
        admin: false,
        createdAt: '2024-01-05T00:00:00',
        updatedAt: '2024-01-10T00:00:00'
      }
    }).as('userDetail');
    
    cy.contains('Account').click();
    cy.url().should('include', '/me');
  });

  it('should not show admin badge for regular user', () => {
    cy.contains('You are admin').should('not.exist');
  });

  it('should show delete account button', () => {
    cy.contains('Delete my account').should('be.visible');
  });

  it('should delete account successfully', () => {
    cy.intercept('DELETE', '/api/user/2', {
      statusCode: 200,
      body: {}
    }).as('deleteUser');
    
    cy.contains('button', 'Detail').click();
    cy.wait('@deleteUser');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

