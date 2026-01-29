import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeacherService } from '../services/teacher.service';
import { SessionApiService } from '../features/sessions/services/session-api.service';
import { Teacher } from '../interfaces/teacher.interface';
import { Session } from '../features/sessions/interfaces/session.interface';

describe('Teacher and Session Relationship Integration Tests', () => {
  let teacherService: TeacherService;
  let sessionApiService: SessionApiService;
  let httpMock: HttpTestingController;

  const mockTeachers: Teacher[] = [
    {
      id: 1,
      lastName: 'DELAHAYE',
      firstName: 'Margot',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 2,
      lastName: 'THIERCELIN',
      firstName: 'Hélène',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }
  ];

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Morning Flow',
      description: 'Start your day with energy',
      date: new Date('2024-02-01'),
      teacher_id: 1,
      users: [1, 2],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 2,
      name: 'Evening Meditation',
      description: 'Wind down your day',
      date: new Date('2024-02-01'),
      teacher_id: 2,
      users: [1, 3, 4],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService, SessionApiService]
    });

    teacherService = TestBed.inject(TeacherService);
    sessionApiService = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Teacher Information Retrieval', () => {
    it('should get all teachers for session assignment', () => {
      teacherService.all().subscribe(teachers => {
        expect(teachers.length).toBe(2);
        expect(teachers[0].firstName).toBe('Margot');
        expect(teachers[1].firstName).toBe('Hélène');
      });

      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    it('should get specific teacher details for a session', () => {
      const teacherId = '1';

      teacherService.detail(teacherId).subscribe(teacher => {
        expect(teacher.id).toBe(1);
        expect(teacher.lastName).toBe('DELAHAYE');
      });

      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers[0]);
    });
  });

  describe('Session with Teacher Context', () => {
    it('should load session with teacher information', () => {
      const sessionId = '1';

      // Get session
      sessionApiService.detail(sessionId).subscribe(session => {
        expect(session.teacher_id).toBe(1);

        // Get teacher for this session
        teacherService.detail(session.teacher_id.toString()).subscribe(teacher => {
          expect(teacher.id).toBe(session.teacher_id);
          expect(teacher.firstName).toBe('Margot');
        });
      });

      const sessionReq = httpMock.expectOne(`api/session/${sessionId}`);
      sessionReq.flush(mockSessions[0]);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeachers[0]);
    });

    it('should load all sessions with their respective teachers', () => {
      sessionApiService.all().subscribe(sessions => {
        expect(sessions.length).toBe(2);

        // Load each teacher
        sessions.forEach(session => {
          teacherService.detail(session.teacher_id.toString()).subscribe(teacher => {
            expect(teacher.id).toBe(session.teacher_id);
          });
        });
      });

      const sessionsReq = httpMock.expectOne('api/session');
      sessionsReq.flush(mockSessions);

      // Requests for teachers
      const teacher1Req = httpMock.expectOne('api/teacher/1');
      teacher1Req.flush(mockTeachers[0]);

      const teacher2Req = httpMock.expectOne('api/teacher/2');
      teacher2Req.flush(mockTeachers[1]);
    });
  });

  describe('Creating Sessions with Teachers', () => {
    it('should create session and verify teacher is valid', () => {
      const teacherId = 1;

      // First verify teacher exists
      teacherService.detail(teacherId.toString()).subscribe(teacher => {
        expect(teacher.id).toBe(teacherId);

        // Then create session with this teacher
        const newSession: Session = {
          name: 'New Yoga Class',
          description: 'A new session',
          date: new Date('2024-03-01'),
          teacher_id: teacher.id,
          users: []
        };

        sessionApiService.create(newSession).subscribe(created => {
          expect(created.teacher_id).toBe(teacherId);
        });
      });

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeachers[0]);

      const sessionReq = httpMock.expectOne('api/session');
      sessionReq.flush({ ...sessionReq.request.body, id: 3 });
    });

    it('should list teachers before creating a session', () => {
      // Step 1: Get all available teachers
      teacherService.all().subscribe(teachers => {
        expect(teachers.length).toBeGreaterThan(0);

        // Step 2: Select a teacher and create session
        const selectedTeacher = teachers[0];
        const newSession: Session = {
          name: 'Beginner Yoga',
          description: 'For beginners',
          date: new Date('2024-03-15'),
          teacher_id: selectedTeacher.id,
          users: []
        };

        sessionApiService.create(newSession).subscribe(created => {
          expect(created.teacher_id).toBe(selectedTeacher.id);
        });
      });

      const teachersReq = httpMock.expectOne('api/teacher');
      teachersReq.flush(mockTeachers);

      const createReq = httpMock.expectOne('api/session');
      createReq.flush({ ...createReq.request.body, id: 5 });
    });
  });

  describe('Updating Session Teacher', () => {
    it('should update session with different teacher', () => {
      const sessionId = '1';
      const newTeacherId = 2;

      // Get current session
      sessionApiService.detail(sessionId).subscribe(session => {
        expect(session.teacher_id).toBe(1);

        // Update with new teacher
        const updatedSession = { ...session, teacher_id: newTeacherId };
        sessionApiService.update(sessionId, updatedSession).subscribe(updated => {
          expect(updated.teacher_id).toBe(newTeacherId);

          // Verify new teacher info
          teacherService.detail(newTeacherId.toString()).subscribe(teacher => {
            expect(teacher.id).toBe(newTeacherId);
            expect(teacher.firstName).toBe('Hélène');
          });
        });
      });

      const detailReq = httpMock.expectOne(`api/session/${sessionId}`);
      detailReq.flush(mockSessions[0]);

      const updateReq = httpMock.expectOne(`api/session/${sessionId}`);
      updateReq.flush({ ...mockSessions[0], teacher_id: newTeacherId });

      const teacherReq = httpMock.expectOne('api/teacher/2');
      teacherReq.flush(mockTeachers[1]);
    });
  });

  describe('Teacher Session Count', () => {
    it('should count sessions per teacher', () => {
      sessionApiService.all().subscribe(sessions => {
        const teacher1Sessions = sessions.filter(s => s.teacher_id === 1);
        const teacher2Sessions = sessions.filter(s => s.teacher_id === 2);

        expect(teacher1Sessions.length).toBe(1);
        expect(teacher2Sessions.length).toBe(1);
      });

      const req = httpMock.expectOne('api/session');
      req.flush(mockSessions);
    });

    it('should find all sessions for a specific teacher', () => {
      const targetTeacherId = 1;

      sessionApiService.all().subscribe(sessions => {
        const teacherSessions = sessions.filter(s => s.teacher_id === targetTeacherId);
        
        expect(teacherSessions.length).toBeGreaterThan(0);
        teacherSessions.forEach(session => {
          expect(session.teacher_id).toBe(targetTeacherId);
        });
      });

      const req = httpMock.expectOne('api/session');
      req.flush(mockSessions);
    });
  });

  describe('Complete Teacher-Session Workflow', () => {
    it('should handle complete workflow: list teachers -> select -> create session -> view with teacher', () => {
      // 1. List all teachers
      teacherService.all().subscribe(teachers => {
        expect(teachers.length).toBe(2);
      });

      const allTeachersReq = httpMock.expectOne('api/teacher');
      allTeachersReq.flush(mockTeachers);

      // 2. Get specific teacher details
      teacherService.detail('1').subscribe(teacher => {
        expect(teacher.firstName).toBe('Margot');
      });

      const teacherDetailReq = httpMock.expectOne('api/teacher/1');
      teacherDetailReq.flush(mockTeachers[0]);

      // 3. Create session with selected teacher
      const newSession: Session = {
        name: 'Complete Flow',
        description: 'Full session',
        date: new Date('2024-04-01'),
        teacher_id: 1,
        users: []
      };

      sessionApiService.create(newSession).subscribe(created => {
        expect(created.id).toBe(10);
      });

      const createReq = httpMock.expectOne('api/session');
      createReq.flush({ ...newSession, id: 10 });

      // 4. View created session with teacher
      sessionApiService.detail('10').subscribe(session => {
        expect(session.teacher_id).toBe(1);
      });

      const sessionDetailReq = httpMock.expectOne('api/session/10');
      sessionDetailReq.flush({ ...newSession, id: 10 });
    });
  });
});
