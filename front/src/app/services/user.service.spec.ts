import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP en attente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should retrieve a user by id', () => {
      const mockUser: User = {
        id: 1,
        email: 'test@test.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: false,
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.getById('1').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle different user ids', () => {
      const mockUser: User = {
        id: 42,
        email: 'user42@test.com',
        lastName: 'Smith',
        firstName: 'Jane',
        admin: true,
        password: 'password456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.getById('42').subscribe((user) => {
        expect(user.id).toBe(42);
        expect(user.email).toBe('user42@test.com');
      });

      const req = httpMock.expectOne('api/user/42');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('delete', () => {
    it('should send DELETE request to remove user', () => {
      service.delete('1').subscribe((response) => {
        expect(response).toEqual({ message: 'User deleted' });
      });

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'User deleted' });
    });

    it('should handle delete for different user ids', () => {
      service.delete('99').subscribe();

      const req = httpMock.expectOne('api/user/99');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
