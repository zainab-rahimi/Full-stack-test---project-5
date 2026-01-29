describe('Logout spec', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should logout successfully', () => {
    cy.contains('Logout').should('be.visible');
    cy.contains('Logout').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should clear session and redirect to home', () => {
    cy.contains('Logout').click();
    cy.contains('Login').should('be.visible');
    cy.contains('Register').should('be.visible');
  });

  it('should not be able to access protected routes after logout', () => {
    cy.contains('Logout').click();
    
    cy.intercept('GET', '/api/session', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('unauthorizedSessions');
    
    cy.visit('/sessions');
    cy.url().should('include', '/login');
  });

  it('should not be able to access account page after logout', () => {
    cy.contains('Logout').click();
    
    cy.intercept('GET', '/api/user/*', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('unauthorizedUser');
    
    cy.visit('/me');
    cy.url().should('include', '/login');
  });

  it('should be able to login again after logout', () => {
    cy.contains('Logout').click();
    
    cy.loginAsAdmin();
    cy.contains('Logout').should('be.visible');
    cy.url().should('include', '/sessions');
  });
});

