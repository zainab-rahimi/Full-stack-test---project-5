import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be logged in initially', () => {
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  describe('logIn', () => {
    it('should set session information and isLogged to true', () => {
      const mockUser: SessionInformation = {
        token: 'jwt-token-123',
        type: 'Bearer',
        id: 1,
        username: 'yoga@studio.com',
        firstName: 'Yoga',
        lastName: 'Studio',
        admin: true
      };

      service.logIn(mockUser);

      expect(service.isLogged).toBe(true);
      expect(service.sessionInformation).toEqual(mockUser);
    });

    it('should emit isLogged state through observable', (done) => {
      const mockUser: SessionInformation = {
        token: 'token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };

      // Subscribe before login to catch the emission
      service.$isLogged().subscribe((isLogged) => {
        if (isLogged) {
          expect(isLogged).toBe(true);
          done();
        }
      });

      service.logIn(mockUser);
    });
  });

  describe('logOut', () => {
    it('should clear session information and set isLogged to false', () => {
      // First login
      const mockUser: SessionInformation = {
        token: 'token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };
      
      service.logIn(mockUser);
      
      // Then logout
      service.logOut();

      expect(service.isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
    });

    it('should emit false through observable when logged out', (done) => {
      const mockUser: SessionInformation = {
        token: 'token',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };

      service.logIn(mockUser);

      service.$isLogged().subscribe((isLogged) => {
        if (!isLogged) {
          expect(isLogged).toBe(false);
          done();
        }
      });

      service.logOut();
    });
  });

  describe('$isLogged observable', () => {
    it('should return an Observable of boolean', (done) => {
      service.$isLogged().subscribe((value) => {
        expect(typeof value).toBe('boolean');
        done();
      });
    });
  });
});
