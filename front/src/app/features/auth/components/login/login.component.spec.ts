import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { Router } from '@angular/router';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let sessionService: SessionService;
  let router: Router;

  const mockSessionInformation: SessionInformation = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [SessionService],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with email and password fields', () => {
    expect(component.form.contains('email')).toBeTruthy();
    expect(component.form.contains('password')).toBeTruthy();
  });

  it('should make the email control required', () => {
    const control = component.form.get('email');
    control?.setValue('');
    expect(control?.hasError('required')).toBeTruthy();
  });

  it('should validate email format', () => {
    const control = component.form.get('email');
    control?.setValue('invalid-email');
    expect(control?.hasError('email')).toBeTruthy();
  });

  it('should make the password control required', () => {
    const control = component.form.get('password');
    control?.setValue('');
    expect(control?.hasError('required')).toBeTruthy();
  });

  it('should call authService.login and navigate on successful login', () => {
    const loginSpy = jest.spyOn(authService, 'login').mockReturnValue(of(mockSessionInformation));
    const sessionSpy = jest.spyOn(sessionService, 'logIn');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });

    component.submit();

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
    expect(sessionSpy).toHaveBeenCalledWith(mockSessionInformation);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
    expect(component.onError).toBe(false);
  });

  it('should set onError to true on login failure', () => {
    jest.spyOn(authService, 'login').mockReturnValue(throwError(() => new Error('Login failed')));

    component.form.setValue({
      email: 'test@test.com',
      password: 'wrongpassword'
    });

    component.submit();

    expect(component.onError).toBe(true);
  });
});
