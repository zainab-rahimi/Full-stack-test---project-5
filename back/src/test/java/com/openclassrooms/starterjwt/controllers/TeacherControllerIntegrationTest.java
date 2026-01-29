package com.openclassrooms.starterjwt.controllers;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
/**
 * Integration tests for TeacherController using H2 database
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Teacher Controller Integration Tests")
class TeacherControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private TeacherRepository teacherRepository;
    private Teacher teacher1;
    private Teacher teacher2;
    @BeforeEach
    void setUp() {
        // Clean database
        teacherRepository.deleteAll();
        // Create test teachers
        teacher1 = Teacher.builder()
                .firstName("John")
                .lastName("Doe")
                .build();
        teacher1 = teacherRepository.save(teacher1);
        teacher2 = Teacher.builder()
                .firstName("Jane")
                .lastName("Smith")
                .build();
        teacher2 = teacherRepository.save(teacher2);
    }
    // ===== FIND BY ID TESTS =====
    @Test
    @DisplayName("Should return teacher when ID exists")
    @WithMockUser
    void testFindById_Success() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", teacher1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacher1.getId()))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"));
    }
    @Test
    @DisplayName("Should return 404 when teacher ID does not exist")
    @WithMockUser
    void testFindById_NotFound() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", 9999L))
                .andExpect(status().isNotFound());
    }
    @Test
    @DisplayName("Should return 400 for invalid ID format")
    @WithMockUser
    void testFindById_BadRequest() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }
    // ===== FIND ALL TESTS =====
    @Test
    @DisplayName("Should return all teachers")
    @WithMockUser
    void testFindAll_Success() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].firstName", is("John")))
                .andExpect(jsonPath("$[0].lastName", is("Doe")))
                .andExpect(jsonPath("$[1].firstName", is("Jane")))
                .andExpect(jsonPath("$[1].lastName", is("Smith")));
    }
    @Test
    @DisplayName("Should return empty list when no teachers exist")
    @WithMockUser
    void testFindAll_EmptyList() throws Exception {
        teacherRepository.deleteAll();
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
    @Test
    @DisplayName("Should return single teacher in list")
    @WithMockUser
    void testFindAll_SingleTeacher() throws Exception {
        teacherRepository.deleteAll();
        Teacher teacher = Teacher.builder()
                .firstName("Single")
                .lastName("Teacher")
                .build();
        teacherRepository.save(teacher);
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].firstName", is("Single")))
                .andExpect(jsonPath("$[0].lastName", is("Teacher")));
    }
}
