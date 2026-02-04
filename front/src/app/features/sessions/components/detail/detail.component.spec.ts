import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let sessionService: SessionService;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let router: Router;
  let matSnackBar: MatSnackBar;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  };

  const mockSession: Session = {
    id: 1,
    name: 'Test Session',
    description: 'Test Description',
    date: new Date('2024-02-15'),
    teacher_id: 1,
    users: [1, 2, 3],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'DELAHAYE',
    firstName: 'Margot',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      declarations: [DetailComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        SessionApiService,
        TeacherService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ],
    })
      .compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);

    jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));
    jest.spyOn(teacherService, 'detail').mockReturnValue(of(mockTeacher));

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load session on init', () => {
      expect(component.session).toEqual(mockSession);
      expect(sessionApiService.detail).toHaveBeenCalledWith('1');
    });

    it('should load teacher information', () => {
      expect(component.teacher).toEqual(mockTeacher);
      expect(teacherService.detail).toHaveBeenCalledWith('1');
    });

    it('should set isAdmin based on session service', () => {
      expect(component.isAdmin).toBe(true);
    });

    it('should determine if user is participating', () => {
      expect(component.isParticipate).toBe(true);
    });
  });

  describe('User Participation - Non-participating user', () => {
    beforeEach(() => {
      const nonParticipatingSessionService = {
        sessionInformation: {
          admin: false,
          id: 99
        }
      };

      TestBed.overrideProvider(SessionService, { useValue: nonParticipatingSessionService });

      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));
      jest.spyOn(teacherService, 'detail').mockReturnValue(of(mockTeacher));

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isParticipate to false for non-participating user', () => {
      expect(component.isParticipate).toBe(false);
    });

    it('should set isAdmin to false for regular user', () => {
      expect(component.isAdmin).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back() is called', () => {
      const spy = jest.spyOn(window.history, 'back');
      component.back();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Session Deletion', () => {
    it('should delete session and navigate to sessions list', () => {
      const deleteSpy = jest.spyOn(sessionApiService, 'delete').mockReturnValue(of({}));
      const navigateSpy = jest.spyOn(router, 'navigate');
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');

      component.delete();

      expect(deleteSpy).toHaveBeenCalledWith('1');
      expect(snackBarSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('Participation Management', () => {
    it('should add participation and refresh session', () => {
      const participateSpy = jest.spyOn(sessionApiService, 'participate').mockReturnValue(of(void 0));
      const detailSpy = jest.spyOn(sessionApiService, 'detail').mockReturnValue(of({
        ...mockSession,
        users: [1, 2, 3, 99]
      }));

      component.participate();

      expect(participateSpy).toHaveBeenCalledWith('1', '1');
      expect(detailSpy).toHaveBeenCalled();
    });

    it('should remove participation and refresh session', () => {
      const unParticipateSpy = jest.spyOn(sessionApiService, 'unParticipate').mockReturnValue(of(void 0));
      const detailSpy = jest.spyOn(sessionApiService, 'detail').mockReturnValue(of({
        ...mockSession,
        users: [2, 3]
      }));

      component.unParticipate();

      expect(unParticipateSpy).toHaveBeenCalledWith('1', '1');
      expect(detailSpy).toHaveBeenCalled();
    });

    it('should update isParticipate after participation', () => {
      jest.spyOn(sessionApiService, 'participate').mockReturnValue(of(void 0));
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of({
        ...mockSession,
        users: [1, 2, 3]
      }));

      component.isParticipate = false;
      component.participate();

      expect(component.isParticipate).toBe(true);
    });

    it('should update isParticipate after unparticipation', () => {
      jest.spyOn(sessionApiService, 'unParticipate').mockReturnValue(of(void 0));
      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of({
        ...mockSession,
        users: [2, 3]
      }));

      component.unParticipate();

      expect(component.isParticipate).toBe(false);
    });
  });

  describe('Session Data Display', () => {
    it('should display session details correctly', () => {
      expect(component.session?.name).toBe('Test Session');
      expect(component.session?.description).toBe('Test Description');
      expect(component.session?.users.length).toBe(3);
    });

    it('should display teacher details correctly', () => {
      expect(component.teacher?.firstName).toBe('Margot');
      expect(component.teacher?.lastName).toBe('DELAHAYE');
    });
  });
});