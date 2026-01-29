describe('Session form - Create', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    
    // Mock teachers API for the form
    cy.intercept('GET', '/api/teacher', {
      statusCode: 200,
      body: [
        {
          id: 1,
          lastName: 'DELAHAYE',
          firstName: 'Margot',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        },
        {
          id: 2,
          lastName: 'THIERCELIN',
          firstName: 'Hélène',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]
    }).as('teachers');
    
    cy.contains('button', 'Create').click();
    cy.url().should('include', '/sessions/create');
  });

  it('should display create session form', () => {
    cy.get('input[formControlName=name]').should('be.visible');
    cy.get('input[formControlName=date]').should('be.visible');
    cy.get('mat-select[formControlName=teacher_id]').should('be.visible');
    cy.get('textarea[formControlName=description]').should('be.visible');
    cy.contains('button', 'Save').should('be.visible');
  });

  it('should create a new session successfully', () => {
    const timestamp = Date.now();
    cy.intercept('POST', '/api/session', {
      statusCode: 200,
      body: {
        id: 3,
        name: `E2E Test Session ${timestamp}`,
        date: '2025-12-31T00:00:00.000+00:00',
        teacher_id: 1,
        description: 'Session created by E2E test',
        users: [],
        createdAt: '2024-01-23T10:00:00',
        updatedAt: '2024-01-23T10:00:00'
      }
    }).as('createSession');

    // Mock updated sessions list after creation
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Yoga Session 1',
          date: '2024-12-15T00:00:00.000+00:00',
          teacher_id: 1,
          description: 'Morning yoga session',
          users: [2],
          createdAt: '2024-01-01T10:00:00',
          updatedAt: '2024-01-01T10:00:00'
        },
        {
          id: 2,
          name: 'Meditation Session',
          date: '2024-12-20T00:00:00.000+00:00',
          teacher_id: 2,
          description: 'Evening meditation session',
          users: [],
          createdAt: '2024-01-02T10:00:00',
          updatedAt: '2024-01-02T10:00:00'
        },
        {
          id: 3,
          name: `E2E Test Session ${timestamp}`,
          date: '2025-12-31T00:00:00.000+00:00',
          teacher_id: 1,
          description: 'Session created by E2E test',
          users: [],
          createdAt: '2024-01-23T10:00:00',
          updatedAt: '2024-01-23T10:00:00'
        }
      ]
    }).as('updatedSessions');

    cy.get('input[formControlName=name]').type(`E2E Test Session ${timestamp}`);
    cy.get('input[formControlName=date]').type('2025-12-31');
    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.get('mat-option').first().click();
    cy.get('textarea[formControlName=description]').type('Session created by E2E test');

    cy.contains('button', 'Save').click();

    cy.wait('@createSession');
    cy.url().should('include', '/sessions');
  });

  it('should validate required fields', () => {
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('should navigate back to sessions list', () => {
    cy.get('button[mat-icon-button]').first().click();
    cy.url().should('include', '/sessions');
  });
});

describe('Session form - Update', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    
    // Mock teachers API for the form
    cy.intercept('GET', '/api/teacher', {
      statusCode: 200,
      body: [
        {
          id: 1,
          lastName: 'DELAHAYE',
          firstName: 'Margot',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        },
        {
          id: 2,
          lastName: 'THIERCELIN',
          firstName: 'Hélène',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]
    }).as('teachers');

    // Mock the session detail for editing
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
    
    cy.get('mat-card.item').first().within(() => {
      cy.contains('button', 'Edit').click();
    });
    cy.url().should('include', '/sessions/update');
  });

  it('should display update form with existing data', () => {
    cy.get('input[formControlName=name]').should('not.have.value', '');
    cy.get('textarea[formControlName=description]').should('not.have.value', '');
  });

  it('should update session successfully', () => {
    const timestamp = Date.now();
    cy.intercept('PUT', '/api/session/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: `Updated Session ${timestamp}`,
        date: '2024-12-15T00:00:00.000+00:00',
        teacher_id: 1,
        description: 'Morning yoga session for beginners',
        users: [2],
        createdAt: '2024-01-01T10:00:00',
        updatedAt: '2024-01-23T10:00:00'
      }
    }).as('updateSession');

    // Mock updated sessions list after update
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: `Updated Session ${timestamp}`,
          date: '2024-12-15T00:00:00.000+00:00',
          teacher_id: 1,
          description: 'Morning yoga session for beginners',
          users: [2],
          createdAt: '2024-01-01T10:00:00',
          updatedAt: '2024-01-23T10:00:00'
        },
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
    }).as('updatedSessions');

    cy.get('input[formControlName=name]').clear().type(`Updated Session ${timestamp}`);
    cy.contains('button', 'Save').click();

    cy.wait('@updateSession');
    cy.url().should('include', '/sessions');
  });

  it('should validate required fields on update', () => {
    cy.get('input[formControlName=name]').clear();
    cy.contains('button', 'Save').should('be.disabled');
  });
});

describe('Session form - Non-admin access', () => {
  beforeEach(() => {
    cy.loginAsUser();

     cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: []
    }).as('sessions');
  });

  it('should redirect regular user from create page', () => {  
    cy.url().should('not.include', '/create');
    cy.url().should('include', '/sessions');
  });
});

