describe('Not Found Page spec', () => {
  it('should display 404 page when navigating to non-existent route', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    cy.url().should('include', '404');
  });

  it('should display "Page not found!" message', () => {
    cy.visit('/404');
    cy.contains('Page not found !').should('be.visible');
  });

  it('should display 404 heading', () => {
    cy.visit('/some-random-route', { failOnStatusCode: false });
    cy.get('h1').should('contain', 'Page not found !');
  });

  it('should render not-found component', () => {
    cy.visit('/404');
    cy.get('app-not-found').should('exist');
  });

  it('should handle multiple invalid routes', () => {
    const invalidRoutes = [
      '/invalid',
      '/does-not-exist',
      '/random-page',
      '/test-404'
    ];

    invalidRoutes.forEach(route => {
      cy.visit(route, { failOnStatusCode: false });
      cy.url().should('include', '404');
      cy.contains('Page not found !').should('be.visible');
    });
  });

  it('should maintain layout structure', () => {
    cy.visit('/404');
    cy.get('mat-toolbar').should('exist');
  });
});
