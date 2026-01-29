import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SessionApiService } from '../features/sessions/services/session-api.service';
import { TeacherService } from '../services/teacher.service';
import { Session } from '../features/sessions/interfaces/session.interface';
import { Teacher } from '../interfaces/teacher.interface';

describe('Session CRUD Integration Tests', () => {
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let httpMock: HttpTestingController;

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'DELAHAYE',
    firstName: 'Margot',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  const mockSession: Session = {
    id: 1,
    name: 'Morning Yoga',
    description: 'A relaxing morning yoga session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService, TeacherService]
    });

    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Read Operations', () => {
    it('should fetch all sessions and their teachers', () => {
      const mockSessions: Session[] = [
        mockSession,
        { ...mockSession, id: 2, name: 'Evening Yoga', teacher_id: 1 }
      ];

      // Fetch all sessions
      sessionApiService.all().subscribe(sessions => {
        expect(sessions.length).toBe(2);
        expect(sessions[0].name).toBe('Morning Yoga');
        expect(sessions[1].name).toBe('Evening Yoga');

        // Fetch teacher for first session
        teacherService.detail(sessions[0].teacher_id.toString()).subscribe(teacher => {
          expect(teacher.firstName).toBe('Margot');
          expect(teacher.lastName).toBe('DELAHAYE');
        });
      });

      const sessionsReq = httpMock.expectOne('api/session');
      expect(sessionsReq.request.method).toBe('GET');
      sessionsReq.flush(mockSessions);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      expect(teacherReq.request.method).toBe('GET');
      teacherReq.flush(mockTeacher);
    });

    it('should fetch session detail with teacher information', () => {
      // Get session detail
      sessionApiService.detail('1').subscribe(session => {
        expect(session.id).toBe(1);
        expect(session.name).toBe('Morning Yoga');
        expect(session.users.length).toBe(3);

        // Get associated teacher
        teacherService.detail(session.teacher_id.toString()).subscribe(teacher => {
          expect(teacher.id).toBe(1);
          expect(teacher.firstName).toBe('Margot');
        });
      });

      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeacher);
    });
  });

  describe('Create Operations', () => {
    it('should create a new session and fetch it back', () => {
      const newSession: Session = {
        name: 'Afternoon Yoga',
        description: 'Peaceful afternoon practice',
        date: new Date('2024-01-20'),
        teacher_id: 1,
        users: []
      };

      const createdSession: Session = {
        ...newSession,
        id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create session
      sessionApiService.create(newSession).subscribe(created => {
        expect(created.id).toBe(3);
        expect(created.name).toBe('Afternoon Yoga');

        // Verify it can be fetched
        sessionApiService.detail('3').subscribe(fetched => {
          expect(fetched.id).toBe(3);
          expect(fetched.name).toBe('Afternoon Yoga');
        });
      });

      const createReq = httpMock.expectOne('api/session');
      expect(createReq.request.method).toBe('POST');
      expect(createReq.request.body).toEqual(newSession);
      createReq.flush(createdSession);

      const detailReq = httpMock.expectOne('api/session/3');
      detailReq.flush(createdSession);
    });

    it('should create session with all required fields', () => {
      const newSession: Session = {
        name: 'Power Yoga',
        description: 'Intense power yoga workout',
        date: new Date('2024-02-01'),
        teacher_id: 1,
        users: []
      };

      sessionApiService.create(newSession).subscribe(created => {
        expect(created.name).toBe(newSession.name);
        expect(created.description).toBe(newSession.description);
        expect(created.teacher_id).toBe(newSession.teacher_id);
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.body.name).toBe('Power Yoga');
      req.flush({ ...newSession, id: 4 });
    });
  });

  describe('Update Operations', () => {
    it('should update existing session and verify changes', () => {
      const updatedData: Session = {
        ...mockSession,
        name: 'Updated Morning Yoga',
        description: 'Updated description'
      };

      // Update session
      sessionApiService.update('1', updatedData).subscribe(updated => {
        expect(updated.name).toBe('Updated Morning Yoga');
        expect(updated.description).toBe('Updated description');

        // Verify update by fetching
        sessionApiService.detail('1').subscribe(fetched => {
          expect(fetched.name).toBe('Updated Morning Yoga');
        });
      });

      const updateReq = httpMock.expectOne('api/session/1');
      expect(updateReq.request.method).toBe('PUT');
      expect(updateReq.request.body).toEqual(updatedData);
      updateReq.flush(updatedData);

      const detailReq = httpMock.expectOne('api/session/1');
      detailReq.flush(updatedData);
    });
  });

  describe('Delete Operations', () => {
    it('should delete session and verify it no longer exists', () => {
      // Delete session
      sessionApiService.delete('1').subscribe(response => {
        expect(response).toBeTruthy();

        // Verify it's not in the list anymore
        sessionApiService.all().subscribe(sessions => {
          expect(sessions.find(s => s.id === 1)).toBeUndefined();
        });
      });

      const deleteReq = httpMock.expectOne('api/session/1');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      const allReq = httpMock.expectOne('api/session');
      allReq.flush([{ ...mockSession, id: 2 }]);
    });
  });

  describe('Participation Management', () => {
    it('should add participant and verify in session details', () => {
      const userId = '5';
      const sessionId = '1';

      // Add participation
      sessionApiService.participate(sessionId, userId).subscribe(() => {
        expect(true).toBeTruthy();

        // Verify user is in participants
        sessionApiService.detail(sessionId).subscribe(session => {
          expect(session.users).toContain(5);
        });
      });

      const participateReq = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(participateReq.request.method).toBe('POST');
      participateReq.flush(null);

      const detailReq = httpMock.expectOne(`api/session/${sessionId}`);
      detailReq.flush({ ...mockSession, users: [...mockSession.users, 5] });
    });

    it('should remove participant and verify removal', () => {
      const userId = '2';
      const sessionId = '1';

      // Remove participation
      sessionApiService.unParticipate(sessionId, userId).subscribe(() => {
        expect(true).toBeTruthy();

        // Verify user is not in participants
        sessionApiService.detail(sessionId).subscribe(session => {
          expect(session.users).not.toContain(2);
        });
      });

      const unParticipateReq = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(unParticipateReq.request.method).toBe('DELETE');
      unParticipateReq.flush(null);

      const detailReq = httpMock.expectOne(`api/session/${sessionId}`);
      detailReq.flush({ ...mockSession, users: [1, 3] });
    });

    it('should handle multiple users participating in same session', () => {
      const sessionId = '1';
      const userIds = ['4', '5', '6'];

      userIds.forEach(userId => {
        sessionApiService.participate(sessionId, userId).subscribe();
        const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
        req.flush(null);
      });

      // Verify all users are added
      sessionApiService.detail(sessionId).subscribe(session => {
        expect(session.users.length).toBeGreaterThan(3);
      });

      const detailReq = httpMock.expectOne(`api/session/${sessionId}`);
      detailReq.flush({ ...mockSession, users: [1, 2, 3, 4, 5, 6] });
    });
  });

  describe('Complete Session Lifecycle', () => {
    it('should create -> read -> update -> participate -> delete session', () => {
      const newSession: Session = {
        name: 'Test Session',
        description: 'Test description',
        date: new Date('2024-03-01'),
        teacher_id: 1,
        users: []
      };

      // 1. Create
      sessionApiService.create(newSession).subscribe(created => {
        expect(created.id).toBe(10);
      });
      const createReq = httpMock.expectOne('api/session');
      createReq.flush({ ...newSession, id: 10 });

      // 2. Read
      sessionApiService.detail('10').subscribe(session => {
        expect(session.name).toBe('Test Session');
      });
      const readReq = httpMock.expectOne('api/session/10');
      readReq.flush({ ...newSession, id: 10 });

      // 3. Update
      const updated = { ...newSession, id: 10, name: 'Updated Test Session' };
      sessionApiService.update('10', updated).subscribe();
      const updateReq = httpMock.expectOne('api/session/10');
      updateReq.flush(updated);

      // 4. Participate
      sessionApiService.participate('10', '1').subscribe();
      const participateReq = httpMock.expectOne('api/session/10/participate/1');
      participateReq.flush(null);

      // 5. Delete
      sessionApiService.delete('10').subscribe();
      const deleteReq = httpMock.expectOne('api/session/10');
      deleteReq.flush({});
    });
  });
});
