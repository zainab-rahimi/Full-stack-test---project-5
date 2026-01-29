describe('Session detail spec', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    
    // Mock the session detail API
    cy.intercept('GET', '/api/session/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Yoga Session 1',
        date: '2024-12-15T00:00:00.000+00:00',
        teacher_id: 1,
        description: 'Morning yoga session for beginners',
        users: [2],
        createdAt: '2024-01-01T10:00:00',
        updatedAt: '2024-01-01T10:00:00'
      }
    }).as('sessionDetail');

    // Mock teacher API
    cy.intercept('GET', '/api/teacher/1', {
      statusCode: 200,
      body: {
        id: 1,
        lastName: 'DELAHAYE',
        firstName: 'Margot',
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
    }).as('teacherDetail');
    
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Detail').click();
    });
    cy.url().should('include', '/sessions/detail');
  });

  it('should display session details', () => {
    cy.get('h1').should('exist');
    cy.contains('Description').should('be.visible');
  });

  it('should display teacher information', () => {
    cy.contains('Create at').should('be.visible');
  });

  it('should show delete button for admin', () => {
    cy.contains('button', 'Delete').should('be.visible');
  });

  it('should not show participate button for admin', () => {
    cy.contains('button', 'Participate').should('not.exist');
    cy.contains('button', 'Do not participate').should('not.exist');
  });

  it('should navigate back to sessions list', () => {
    cy.get('button[mat-icon-button]').first().click();
    cy.url().should('include', '/sessions');
  });

  it('should delete session successfully', () => {
    cy.intercept('DELETE', '/api/session/1', {
      statusCode: 200,
      body: {}
    }).as('deleteSession');

    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: [
        {
          id: 2,
          name: 'Meditation Session',
          date: '2024-12-20T00:00:00.000+00:00',
          teacher_id: 2,
          description: 'Evening meditation session',
          users: [],
          createdAt: '2024-01-02T10:00:00',
          updatedAt: '2024-01-02T10:00:00'
        }
      ]
    }).as('sessionsAfterDelete');

    cy.contains('button', 'Delete').click();
    cy.wait('@deleteSession');
    cy.url().should('include', '/sessions');
  });
});

describe('Session detail as regular user', () => {
  beforeEach(() => {
    cy.loginAsUser();
    
    // Mock the session detail API
    cy.intercept('GET', '/api/session/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Yoga Session 1',
        date: '2024-12-15T00:00:00.000+00:00',
        teacher_id: 1,
        description: 'Morning yoga session for beginners',
        users: [2],
        createdAt: '2024-01-01T10:00:00',
        updatedAt: '2024-01-01T10:00:00'
      }
    }).as('sessionDetail');

    // Mock teacher API
    cy.intercept('GET', '/api/teacher/1', {
      statusCode: 200,
      body: {
        id: 1,
        lastName: 'DELAHAYE',
        firstName: 'Margot',
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
    }).as('teacherDetail');
    
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Detail').click();
    });
    cy.url().should('include', '/sessions/detail');
  });

  it('should not show delete button for regular user', () => {
    cy.contains('button', 'Delete').should('not.exist');
  });

  it('should show participate or unparticipate button', () => {
    // One of these buttons should exist
    cy.get('body').then($body => {
      const hasParticipate = $body.text().includes('Participate');
      const hasUnparticipate = $body.text().includes('Do not participate');
      expect(hasParticipate || hasUnparticipate).to.be.true;
    });
  });

  it('should handle participate/unparticipate action', () => {
    cy.intercept('POST', '/api/session/1/participate/2', {
      statusCode: 200,
      body: {}
    }).as('participate');
    
    cy.intercept('DELETE', '/api/session/1/participate/2', {
      statusCode: 200,
      body: {}
    }).as('unparticipate');

    // Mock updated session after participation
    cy.intercept('GET', '/api/session/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Yoga Session 1',
        date: '2024-12-15T00:00:00.000+00:00',
        teacher_id: 1,
        description: 'Morning yoga session for beginners',
        users: [],
        createdAt: '2024-01-01T10:00:00',
        updatedAt: '2024-01-01T10:00:00'
      }
    }).as('sessionDetailUpdated');
    
    cy.get('body').then($body => {
      if ($body.text().includes('Participate')) {
        cy.contains('button', 'Participate').click();
        cy.wait('@participate');
      } else if ($body.text().includes('Do not participate')) {
        cy.contains('button', 'Do not participate').click();
        cy.wait('@unparticipate');
      }
    });
  });
});

