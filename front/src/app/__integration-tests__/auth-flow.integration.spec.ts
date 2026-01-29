import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../features/auth/services/auth.service';
import { SessionService } from '../services/session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { LoginRequest } from '../features/auth/interfaces/loginRequest.interface';
import { RegisterRequest } from '../features/auth/interfaces/registerRequest.interface';

describe('Authentication Flow Integration Tests', () => {
  let authService: AuthService;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockSessionInfo: SessionInformation = {
    token: 'jwt-token-123',
    type: 'Bearer',
    id: 1,
    username: 'yoga@studio.com',
    firstName: 'Yoga',
    lastName: 'Studio',
    admin: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, SessionService]
    });

    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Login Flow', () => {
    it('should complete full login flow from request to session update', () => {
      const loginRequest: LoginRequest = {
        email: 'yoga@studio.com',
        password: 'test!1234'
      };

      // Execute login
      authService.login(loginRequest).subscribe(response => {
        // Verify HTTP response
        expect(response).toEqual(mockSessionInfo);
        expect(response.token).toBe('jwt-token-123');
        expect(response.admin).toBe(true);

        // Update session service
        sessionService.logIn(response);

        // Verify session state
        expect(sessionService.isLogged).toBe(true);
        expect(sessionService.sessionInformation).toEqual(mockSessionInfo);
      });

      // Verify HTTP call
      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockSessionInfo);
    });

    it('should handle login failure and not update session', () => {
      const loginRequest: LoginRequest = {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      };

      authService.login(loginRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(sessionService.isLogged).toBe(false);
          expect(sessionService.sessionInformation).toBeUndefined();
        }
      });

      const req = httpMock.expectOne('api/auth/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should maintain session state through observable', (done) => {
      const loginRequest: LoginRequest = {
        email: 'yoga@studio.com',
        password: 'test!1234'
      };

      // Subscribe to session observable before login
      sessionService.$isLogged().subscribe(isLogged => {
        if (isLogged) {
          expect(sessionService.sessionInformation).toBeTruthy();
          expect(sessionService.sessionInformation?.username).toBe('yoga@studio.com');
          done();
        }
      });

      // Perform login
      authService.login(loginRequest).subscribe(response => {
        sessionService.logIn(response);
      });

      const req = httpMock.expectOne('api/auth/login');
      req.flush(mockSessionInfo);
    });
  });

  describe('Registration Flow', () => {
    it('should complete full registration flow', () => {
      const registerRequest: RegisterRequest = {
        email: 'toto@toto.com',
        firstName: 'Toto',
        lastName: 'Test',
        password: 'test!1234'
      };

      authService.register(registerRequest).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(null);
    });

    it('should handle registration failure when email already exists', () => {
      const registerRequest: RegisterRequest = {
        email: 'yoga@studio.com',
        firstName: 'Yoga',
        lastName: 'Studio',
        password: 'test!1234'
      };

      authService.register(registerRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('api/auth/register');
      req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Logout Flow', () => {
    it('should complete full logout flow and clear session', (done) => {
      // First login
      sessionService.logIn(mockSessionInfo);
      expect(sessionService.isLogged).toBe(true);

      // Subscribe to session changes
      sessionService.$isLogged().subscribe(isLogged => {
        if (!isLogged) {
          expect(sessionService.sessionInformation).toBeUndefined();
          done();
        }
      });

      // Logout
      sessionService.logOut();
      expect(sessionService.isLogged).toBe(false);
    });

    it('should allow re-login after logout', () => {
      // Login
      sessionService.logIn(mockSessionInfo);
      expect(sessionService.isLogged).toBe(true);

      // Logout
      sessionService.logOut();
      expect(sessionService.isLogged).toBe(false);
      expect(sessionService.sessionInformation).toBeUndefined();

      // Re-login
      const newSession: SessionInformation = {
        ...mockSessionInfo,
        id: 2,
        username: 'newuser@test.com'
      };

      sessionService.logIn(newSession);
      expect(sessionService.isLogged).toBe(true);
      expect(sessionService.sessionInformation?.id).toBe(2);
    });
  });

  describe('Complete Authentication Cycle', () => {
    it('should handle register -> login -> logout cycle', () => {
      // 1. Register
      const registerRequest: RegisterRequest = {
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        password: 'test!1234'
      };

      authService.register(registerRequest).subscribe(() => {
        expect(true).toBeTruthy();
      });

      const regReq = httpMock.expectOne('api/auth/register');
      regReq.flush(null);

      // 2. Login
      const loginRequest: LoginRequest = {
        email: 'newuser@test.com',
        password: 'test!1234'
      };

      authService.login(loginRequest).subscribe(response => {
        sessionService.logIn(response);
        expect(sessionService.isLogged).toBe(true);
      });

      const loginReq = httpMock.expectOne('api/auth/login');
      loginReq.flush({
        ...mockSessionInfo,
        username: 'newuser@test.com',
        id: 2,
        admin: false
      });

      // 3. Logout
      sessionService.logOut();
      expect(sessionService.isLogged).toBe(false);
    });
  });
});
