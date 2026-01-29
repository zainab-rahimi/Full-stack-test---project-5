import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,  
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        RouterTestingModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with all required fields', () => {
    expect(component.form.contains('email')).toBeTruthy();
    expect(component.form.contains('firstName')).toBeTruthy();
    expect(component.form.contains('lastName')).toBeTruthy();
    expect(component.form.contains('password')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should make all fields required', () => {
    expect(component.form.get('email')?.hasError('required')).toBeTruthy();
    expect(component.form.get('firstName')?.hasError('required')).toBeTruthy();
    expect(component.form.get('lastName')?.hasError('required')).toBeTruthy();
    expect(component.form.get('password')?.hasError('required')).toBeTruthy();
  });

  it('should call authService.register and navigate on successful registration', () => {
    const registerSpy = jest.spyOn(authService, 'register').mockReturnValue(of(void 0));
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    component.submit();

    expect(registerSpy).toHaveBeenCalledWith({
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  });

  it('should set onError to true on registration failure', () => {
    jest.spyOn(authService, 'register').mockReturnValue(throwError(() => new Error('Registration failed')));

    component.form.setValue({
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    component.submit();

    expect(component.onError).toBe(true);
  });
});
