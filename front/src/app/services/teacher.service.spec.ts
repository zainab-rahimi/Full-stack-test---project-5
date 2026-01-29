import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should retrieve all teachers', () => {
      const mockTeachers: Teacher[] = [
        {
          id: 1,
          lastName: 'Doe',
          firstName: 'John',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          lastName: 'Smith',
          firstName: 'Jane',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.all().subscribe((teachers) => {
        expect(teachers).toEqual(mockTeachers);
        expect(teachers.length).toBe(2);
      });

      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    it('should return an empty array when no teachers', () => {
      service.all().subscribe((teachers) => {
        expect(teachers).toEqual([]);
        expect(teachers.length).toBe(0);
      });

      const req = httpMock.expectOne('api/teacher');
      req.flush([]);
    });
  });

  describe('detail', () => {
    it('should retrieve a teacher by id', () => {
      const mockTeacher: Teacher = {
        id: 1,
        lastName: 'Doe',
        firstName: 'John',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.detail('1').subscribe((teacher) => {
        expect(teacher).toEqual(mockTeacher);
        expect(teacher.id).toBe(1);
      });

      const req = httpMock.expectOne('api/teacher/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });
  });
});
