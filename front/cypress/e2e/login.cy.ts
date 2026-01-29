describe('Login spec', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type=submit]').should('be.visible').should('contain', 'Submit');
  });

  it('should login successfully as admin', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ5b2dhQHN0dWRpby5jb20iLCJpYXQiOjE2NjE3ODg0OTEsImV4cCI6MTY2MTg3NDg5MX0.mock-token',
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
      body: []
    }).as('sessions');

    cy.get('input[formControlName=email]').type("yoga@studio.com");
    cy.get('input[formControlName=password]').type("test!1234{enter}{enter}");

    cy.url().should('include', '/sessions');
  });

  it('should login successfully as regular user', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjYxNzg4NDkxLCJleHAiOjE2NjE4NzQ4OTF9.mock-token',
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
      body: []
    }).as('sessions');

    cy.get('input[formControlName=email]').type("test@test.com");
    cy.get('input[formControlName=password]').type("testtest{enter}{enter}");

  
    cy.url().should('include', '/sessions');
  });

  it('should show error on invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials'
      }
    }).as('loginRequest');

    cy.get('input[formControlName=email]').type("wrong@example.com");
    cy.get('input[formControlName=password]').type("wrongpassword{enter}{enter}");

  
    cy.get('.error').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('input[formControlName=email]').should('have.class', 'ng-pristine');
    cy.get('input[formControlName=password]').should('have.class', 'ng-pristine');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should validate email format', () => {
    cy.get('input[formControlName=email]').type('invalid-email');
    cy.get('input[formControlName=email]').blur();
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should have a link to register page', () => {
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });
});