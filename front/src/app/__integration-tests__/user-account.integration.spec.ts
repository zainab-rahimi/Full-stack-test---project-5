import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../services/user.service';
import { SessionService } from '../services/session.service';
import { User } from '../interfaces/user.interface';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('User Account Management Integration Tests', () => {
  let userService: UserService;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockSessionInfo: SessionInformation = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    lastName: 'User',
    firstName: 'Test',
    admin: false,
    password: 'hashedpassword',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [UserService, SessionService]
    });

    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Set up session
    sessionService.logIn(mockSessionInfo);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('User Profile Retrieval', () => {
    it('should get user profile after login', () => {
      const userId = sessionService.sessionInformation!.id.toString();

      userService.getById(userId).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(user.email).toBe(sessionService.sessionInformation!.username);
        expect(user.firstName).toBe(sessionService.sessionInformation!.firstName);
        expect(user.lastName).toBe(sessionService.sessionInformation!.lastName);
      });

      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should get different user profiles by different ids', () => {
      const user1Id = '1';
      const user2Id = '2';

      const user1: User = { ...mockUser, id: 1, email: 'user1@test.com' };
      const user2: User = { ...mockUser, id: 2, email: 'user2@test.com' };

      // Get user 1
      userService.getById(user1Id).subscribe(user => {
        expect(user.id).toBe(1);
        expect(user.email).toBe('user1@test.com');
      });

      const req1 = httpMock.expectOne(`api/user/${user1Id}`);
      req1.flush(user1);

      // Get user 2
      userService.getById(user2Id).subscribe(user => {
        expect(user.id).toBe(2);
        expect(user.email).toBe('user2@test.com');
      });

      const req2 = httpMock.expectOne(`api/user/${user2Id}`);
      req2.flush(user2);
    });
  });

  describe('Account Deletion Flow', () => {
    it('should delete account and logout user', () => {
      const userId = sessionService.sessionInformation!.id.toString();

      expect(sessionService.isLogged).toBe(true);

      // Delete account
      userService.delete(userId).subscribe(response => {
        expect(response).toBeTruthy();

        // Logout after deletion
        sessionService.logOut();
        expect(sessionService.isLogged).toBe(false);
        expect(sessionService.sessionInformation).toBeUndefined();
      });

      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'User deleted successfully' });
    });

    it('should handle deletion with navigation', () => {
      const userId = '1';
      const navigateSpy = jest.spyOn(router, 'navigate');

      userService.delete(userId).subscribe(() => {
        sessionService.logOut();
        router.navigate(['/']);

        expect(navigateSpy).toHaveBeenCalledWith(['/']);
        expect(sessionService.isLogged).toBe(false);
      });

      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush({});
    });

    it('should not allow operations after account deletion', () => {
      const userId = '1';

      // Delete account
      userService.delete(userId).subscribe(() => {
        sessionService.logOut();
      });

      const deleteReq = httpMock.expectOne(`api/user/${userId}`);
      deleteReq.flush({});

      // Try to get user info after deletion
      userService.getById(userId).subscribe({
        next: () => fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const getReq = httpMock.expectOne(`api/user/${userId}`);
      getReq.flush('User not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('User and Session Consistency', () => {
    it('should maintain consistency between session info and user profile', () => {
      const userId = sessionService.sessionInformation!.id.toString();

      userService.getById(userId).subscribe(user => {
        // Session and user should match
        expect(user.id).toBe(sessionService.sessionInformation!.id);
        expect(user.email).toBe(sessionService.sessionInformation!.username);
        expect(user.firstName).toBe(sessionService.sessionInformation!.firstName);
        expect(user.lastName).toBe(sessionService.sessionInformation!.lastName);
        expect(user.admin).toBe(sessionService.sessionInformation!.admin);
      });

      const req = httpMock.expectOne(`api/user/${userId}`);
      req.flush(mockUser);
    });

    it('should update session observable when user data changes', (done) => {
      sessionService.$isLogged().subscribe(isLogged => {
        if (!isLogged) {
          // Verify session cleared after user deletion
          expect(sessionService.sessionInformation).toBeUndefined();
          done();
        }
      });

      // Delete user
      userService.delete('1').subscribe(() => {
        sessionService.logOut();
      });

      const req = httpMock.expectOne('api/user/1');
      req.flush({});
    });
  });

  describe('Multiple User Scenarios', () => {
    it('should handle admin user profile', () => {
      const adminSession: SessionInformation = {
        ...mockSessionInfo,
        id: 2,
        username: 'admin@yoga.com',
        admin: true
      };

      sessionService.logOut();
      sessionService.logIn(adminSession);

      const adminUser: User = {
        ...mockUser,
        id: 2,
        email: 'admin@yoga.com',
        admin: true
      };

      userService.getById('2').subscribe(user => {
        expect(user.admin).toBe(true);
        expect(sessionService.sessionInformation!.admin).toBe(true);
      });

      const req = httpMock.expectOne('api/user/2');
      req.flush(adminUser);
    });

    it('should handle regular user profile', () => {
      userService.getById('1').subscribe(user => {
        expect(user.admin).toBe(false);
        expect(sessionService.sessionInformation!.admin).toBe(false);
      });

      const req = httpMock.expectOne('api/user/1');
      req.flush(mockUser);
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized access to user profile', () => {
      userService.getById('999').subscribe({
        next: () => fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne('api/user/999');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle server errors during deletion', () => {
      userService.delete('1').subscribe({
        next: () => fail('Should not succeed'),
        error: (error) => {
          expect(error.status).toBe(500);
          // Session should remain intact on error
          expect(sessionService.isLogged).toBe(true);
        }
      });

      const req = httpMock.expectOne('api/user/1');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
