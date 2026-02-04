import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiService: SessionApiService;
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
    users: [1, 2],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        SessionApiService
      ],
      declarations: [FormComponent]
    })
      .compileComponents();

    sessionApiService = TestBed.inject(SessionApiService);
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form in create mode', () => {
      expect(component.onUpdate).toBe(false);
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm?.get('name')?.value).toBe('');
      expect(component.sessionForm?.get('description')?.value).toBe('');
    });

    it('should have all required form fields', () => {
      expect(component.sessionForm?.get('name')).toBeTruthy();
      expect(component.sessionForm?.get('date')).toBeTruthy();
      expect(component.sessionForm?.get('teacher_id')).toBeTruthy();
      expect(component.sessionForm?.get('description')).toBeTruthy();
    });

    it('should validate required fields', () => {
      const form = component.sessionForm!;
      
      expect(form.get('name')?.hasError('required')).toBe(true);
      expect(form.get('date')?.hasError('required')).toBe(true);
      expect(form.get('teacher_id')?.hasError('required')).toBe(true);
      expect(form.get('description')?.hasError('required')).toBe(true);
    });

    it('should create session when form is submitted', () => {
      const createSpy = jest.spyOn(sessionApiService, 'create').mockReturnValue(of(mockSession));
      const navigateSpy = jest.spyOn(router, 'navigate');
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');

      component.sessionForm?.setValue({
        name: 'New Session',
        description: 'New Description',
        date: '2024-03-01',
        teacher_id: 1
      });

      component.submit();

      expect(createSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });

    it('should set onUpdate to false in create mode', () => {
      expect(component.onUpdate).toBe(false);
    });
  });

  describe('Update Mode', () => {
    beforeEach(() => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      jest.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue('1');
      
      const mockRouter = TestBed.inject(Router);
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/sessions/update/1'
      });

      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));

      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize form in update mode', () => {
      expect(component.onUpdate).toBe(true);
    });

    it('should load session data in update mode', () => {
      expect(component.sessionForm?.get('name')?.value).toBe('Test Session');
      expect(component.sessionForm?.get('description')?.value).toBe('Test Description');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(1);
    });

    it('should update session when form is submitted', () => {
      const updateSpy = jest.spyOn(sessionApiService, 'update').mockReturnValue(of(mockSession));
      const navigateSpy = jest.spyOn(router, 'navigate');
      const snackBarSpy = jest.spyOn(matSnackBar, 'open');

      component.sessionForm?.patchValue({
        name: 'Updated Session'
      });

      component.submit();

      expect(updateSpy).toHaveBeenCalledWith('1', expect.any(Object));
      expect(snackBarSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });

    it('should call detail API when in update mode', () => {
      const detailSpy = jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(mockSession));
      
      component.ngOnInit();
      
      expect(detailSpy).toHaveBeenCalledWith('1');
    });
  });

  describe('Non-Admin Access', () => {
    it('should redirect non-admin users to sessions', () => {
      // Reset TestBed with non-admin user
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([
            { path: 'sessions', component: FormComponent }
          ]),
          HttpClientModule,
          MatCardModule,
          MatIconModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatSnackBarModule,
          ReactiveFormsModule,
          NoopAnimationsModule
        ],
        providers: [
          {
            provide: SessionService,
            useValue: {
              sessionInformation: {
                admin: false,
                id: 2
              }
            }
          },
          SessionApiService,
          TeacherService
        ],
        declarations: [FormComponent]
      });
      
      fixture = TestBed.createComponent(FormComponent);
      const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate');
      component = fixture.componentInstance;
      
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should accept valid description length', () => {
      const form = component.sessionForm!;
      const validDescription = 'a'.repeat(2000);
      
      form.get('description')?.setValue(validDescription);
      
      expect(form.get('description')?.hasError('max')).toBe(false);
    });

    it('should have valid form when all fields are filled', () => {
      component.sessionForm?.setValue({
        name: 'Valid Session',
        description: 'Valid Description',
        date: '2024-03-01',
        teacher_id: 1
      });

      expect(component.sessionForm?.valid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(FormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should handle date formatting correctly', () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      jest.spyOn(activatedRoute.snapshot.paramMap, 'get').mockReturnValue('1');
      
      const mockRouter = TestBed.inject(Router);
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/sessions/update/1'
      });

      const sessionWithDate = {
        ...mockSession,
        date: new Date('2024-05-20T10:30:00')
      };

      jest.spyOn(sessionApiService, 'detail').mockReturnValue(of(sessionWithDate));

      component.ngOnInit();

      expect(component.sessionForm?.get('date')?.value).toContain('2024-05-20');
    });

    it('should handle empty session in initForm', () => {
      component['initForm']();
      
      expect(component.sessionForm?.get('name')?.value).toBe('');
      expect(component.sessionForm?.get('description')?.value).toBe('');
    });

    it('should handle session with data in initForm', () => {
      component['initForm'](mockSession);
      
      expect(component.sessionForm?.get('name')?.value).toBe('Test Session');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(1);
    });
  });
});
