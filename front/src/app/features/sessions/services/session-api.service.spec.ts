import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SessionApiService } from './session-api.service';
import { Session } from '../interfaces/session.interface';

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should retrieve all sessions', () => {
      const mockSessions: Session[] = [
        {
          id: 1,
          name: 'Yoga Session',
          description: 'Morning yoga',
          date: new Date(),
          teacher_id: 1,
          users: [1, 2],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.all().subscribe((sessions) => {
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(1);
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });
  });

  describe('detail', () => {
    it('should retrieve a session by id', () => {
      const mockSession: Session = {
        id: 1,
        name: 'Yoga Session',
        description: 'Morning yoga',
        date: new Date(),
        teacher_id: 1,
        users: [1, 2],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.detail('1').subscribe((session) => {
        expect(session).toEqual(mockSession);
      });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });
  });

  describe('delete', () => {
    it('should delete a session', () => {
      service.delete('1').subscribe((response) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('create', () => {
    it('should create a new session', () => {
      const newSession: Session = {
        name: 'New Yoga Session',
        description: 'Evening yoga',
        date: new Date(),
        teacher_id: 1,
        users: []
      };

      service.create(newSession).subscribe((session) => {
        expect(session.name).toBe('New Yoga Session');
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession);
      req.flush(newSession);
    });
  });

  describe('update', () => {
    it('should update a session', () => {
      const updatedSession: Session = {
        id: 1,
        name: 'Updated Session',
        description: 'Updated description',
        date: new Date(),
        teacher_id: 1,
        users: [1]
      };

      service.update('1', updatedSession).subscribe((session) => {
        expect(session).toEqual(updatedSession);
      });

      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSession);
      req.flush(updatedSession);
    });
  });

  describe('participate', () => {
    it('should add user participation to session', () => {
      service.participate('1', '2').subscribe();

      const req = httpMock.expectOne('api/session/1/participate/2');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });
  });

  describe('unParticipate', () => {
    it('should remove user participation from session', () => {
      service.unParticipate('1', '2').subscribe();

      const req = httpMock.expectOne('api/session/1/participate/2');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
