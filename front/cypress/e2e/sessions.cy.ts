describe('Sessions list spec', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should display list of sessions', () => {
    cy.get('mat-card.item').should('exist');
    cy.contains('Sessions').should('be.visible');
  });

  it('should show create button for admin', () => {
    cy.contains('button', 'Create').should('be.visible');
  });

  it('should navigate to create session page', () => {
    cy.contains('button', 'Create').click();
    cy.url().should('include', '/sessions/create');
  });

  it('should display session cards with details', () => {
    cy.get('mat-card.item').first().within(() => {
      cy.get('mat-card-title').should('exist');
      cy.get('mat-card-content').should('exist');
    });
  });

  it('should show edit and detail buttons for admin', () => {
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Edit').should('be.visible');
      cy.contains('button', 'Detail').should('be.visible');
    });
  });

  it('should navigate to edit session page', () => {
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Edit').click();
    });
    cy.url().should('include', '/sessions/update');
  });

  it('should navigate to session detail page', () => {
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Detail').click();
    });
    cy.url().should('include', '/sessions/detail');
  });
});

describe('Sessions list as regular user', () => {
  beforeEach(() => {
    cy.loginAsUser();
  });

  it('should not show create button for regular user', () => {
    cy.contains('button', 'Create').should('not.exist');
  });

  it('should not show edit button for regular user', () => {
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Edit').should('not.exist');
    });
  });

  it('should show detail button for regular user', () => {
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Detail').should('be.visible');
    });
  });
});

