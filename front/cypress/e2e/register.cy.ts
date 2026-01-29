describe('Register spec', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display register form', () => {
    cy.get('input[formControlName=firstName]').should('be.visible');
    cy.get('input[formControlName=lastName]').should('be.visible');
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type=submit]').should('be.visible').should('contain', 'Submit');
  });

  it('should register successfully and redirect to login', () => {
    const timestamp = Date.now();
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        message: 'User registered successfully!'
      }
    }).as('registerRequest');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type(`john.doe${timestamp}@example.com`);
    cy.get('input[formControlName=password]').type('password123');
    
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest');
    cy.url().should('include', '/login');
  });

  it('should show error when registration fails', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        message: 'Email already exists'
      }
    }).as('registerRequest');

    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('password123');
    
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest');
    cy.get('.error').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('button[type=submit]').should('be.disabled');
    cy.get('input[formControlName=firstName]').should('have.class', 'ng-pristine');
    cy.get('input[formControlName=lastName]').should('have.class', 'ng-pristine');
    cy.get('input[formControlName=email]').should('have.class', 'ng-pristine');
    cy.get('input[formControlName=password]').should('have.class', 'ng-pristine');
  });

  it('should validate email format', () => {
    cy.get('input[formControlName=email]').type('invalid-email');
    cy.get('input[formControlName=email]').blur();
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should have a link to login page', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });
});

