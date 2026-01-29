import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should send POST request to register endpoint', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      service.register(registerRequest).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(null);
    });
  });

  describe('login', () => {
    it('should send POST request to login endpoint and return session information', () => {
      const loginRequest: LoginRequest = {
        email: 'test@test.com',
        password: 'password123'
      };

      const mockResponse: SessionInformation = {
        token: 'jwt-token-abc123',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };

      service.login(loginRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.token).toBe('jwt-token-abc123');
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });
  });
});
