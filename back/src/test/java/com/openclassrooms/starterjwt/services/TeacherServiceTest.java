package com.openclassrooms.starterjwt.services;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
/**
 * Unit tests for TeacherService
 * Using Mockito to mock the repository layer
 */
@ExtendWith(MockitoExtension.class)
public class TeacherServiceTest {
    @Mock
    private TeacherRepository teacherRepository;
    @InjectMocks
    private TeacherService teacherService;
    private Teacher teacher1;
    private Teacher teacher2;
    @BeforeEach
    public void setUp() {
        // Initialize test data before each test
        teacher1 = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        teacher2 = Teacher.builder()
                .id(2L)
                .firstName("Jane")
                .lastName("Smith")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
    @Test
    public void testFindAll_ShouldReturnAllTeachers() {
        // Given: Mock the repository to return a list of teachers
        List<Teacher> expectedTeachers = Arrays.asList(teacher1, teacher2);
        when(teacherRepository.findAll()).thenReturn(expectedTeachers);
        // When: Call the service method
        List<Teacher> result = teacherService.findAll();
        // Then: Verify the result and interactions
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(teacher1, teacher2);
        // Verify that repository method was called exactly once
        verify(teacherRepository, times(1)).findAll();
    }
    @Test
    public void testFindAll_ShouldReturnEmptyList_WhenNoTeachers() {
        // Given: Mock the repository to return an empty list
        when(teacherRepository.findAll()).thenReturn(Arrays.asList());
        // When: Call the service method
        List<Teacher> result = teacherService.findAll();
        // Then: Verify the result is an empty list
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(teacherRepository, times(1)).findAll();
    }
    @Test
    public void testFindById_ShouldReturnTeacher_WhenTeacherExists() {
        // Given: Mock the repository to return a teacher
        Long teacherId = 1L;
        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(teacher1));
        // When: Call the service method
        Teacher result = teacherService.findById(teacherId);
        // Then: Verify the result
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(teacherId);
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        verify(teacherRepository, times(1)).findById(teacherId);
    }
    @Test
    public void testFindById_ShouldReturnNull_WhenTeacherDoesNotExist() {
        // Given: Mock the repository to return empty Optional
        Long nonExistentId = 999L;
        when(teacherRepository.findById(nonExistentId)).thenReturn(Optional.empty());
        // When: Call the service method
        Teacher result = teacherService.findById(nonExistentId);
        // Then: Verify the result is null
        assertThat(result).isNull();
        verify(teacherRepository, times(1)).findById(nonExistentId);
    }
    @Test
    public void testFindById_ShouldHandleNullId() {
        // Given: Mock the repository to return empty Optional for null
        when(teacherRepository.findById(null)).thenReturn(Optional.empty());
        // When: Call the service method with null
        Teacher result = teacherService.findById(null);
        // Then: Verify the result is null
        assertThat(result).isNull();
        verify(teacherRepository, times(1)).findById(null);
    }
}
