// Custom Cypress commands for reusable test actions

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login as admin user (yoga@studio.com)
       */
      loginAsAdmin(): Chainable<void>;
      
      /**
       * Login as regular user (test@test.com)
       */
      loginAsUser(): Chainable<void>;
      
      /**
       * Login with custom credentials
       * @param email - User email
       * @param password - User password
       */
      login(email: string, password: string): Chainable<void>;
    }
  }
}

/**
 * Login as admin user
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ5b2dhQHN0dWRpby5jb20iLCJpYXQiOjE2NjE3ODg0OTEsImV4cCI6MTY2MTg3NDg5MX0.mock-admin-token',
      type: 'Bearer',
      id: 1,
      username: 'yoga@studio.com',
      firstName: 'Admin',
      lastName: 'Admin',
      admin: true
    }
  }).as('loginRequest');
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
      }
    ]
  }).as('sessions');
  
  cy.get('input[formControlName=email]').type('yoga@studio.com');
  cy.get('input[formControlName=password]').type('test!1234{enter}{enter}');
  
  cy.url().should('include', '/sessions');
});

/**
 * Login as regular user
 */
Cypress.Commands.add('loginAsUser', () => {
  cy.visit('/login');
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjYxNzg4NDkxLCJleHAiOjE2NjE4NzQ4OTF9.mock-user-token',
      type: 'Bearer',
      id: 2,
      username: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    }
  }).as('loginRequest');
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
      }
    ]
  }).as('sessions');
  
  cy.get('input[formControlName=email]').type('test@test.com');
  cy.get('input[formControlName=password]').type('testtest{enter}{enter}');
  

  cy.url().should('include', '/sessions');
});

/**
 * Login with custom credentials
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      token: 'mock-custom-token',
      type: 'Bearer',
      id: 3,
      username: email,
      firstName: 'Custom',
      lastName: 'User',
      admin: false
    }
  }).as('loginRequest');
  cy.intercept('GET', '/api/session', {
    statusCode: 200,
    body: []
  }).as('sessions');
  
  cy.get('input[formControlName=email]').type(email);
  cy.get('input[formControlName=password]').type(`${password}{enter}{enter}`);
  

});

export {};
