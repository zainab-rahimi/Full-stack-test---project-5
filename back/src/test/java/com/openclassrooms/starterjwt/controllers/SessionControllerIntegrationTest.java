package com.openclassrooms.starterjwt.controllers;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.ArrayList;
import java.util.Date;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
/**
 * Integration tests for SessionController using H2 database
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Session Controller Integration Tests")
class SessionControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private SessionRepository sessionRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private UserRepository userRepository;
    private Teacher teacher;
    private Session testSession;
    private User testUser;
    @BeforeEach
    void setUp() {
        // Clean database
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        teacherRepository.deleteAll();
        // Create test teacher
        teacher = Teacher.builder()
                .firstName("John")
                .lastName("Doe")
                .build();
        teacher = teacherRepository.save(teacher);
        // Create test user
        testUser = User.builder()
                .email("user@test.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("password")
                .admin(false)
                .build();
        testUser = userRepository.save(testUser);
        // Create test session
        testSession = Session.builder()
                .name("Yoga Session")
                .date(new Date())
                .description("Morning yoga session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();
        testSession = sessionRepository.save(testSession);
    }
    // ===== FIND BY ID TESTS =====
    @Test
    @DisplayName("Should return session when ID exists")
    @WithMockUser
    void testFindById_Success() throws Exception {
        mockMvc.perform(get("/api/session/{id}", testSession.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testSession.getId()))
                .andExpect(jsonPath("$.name").value("Yoga Session"))
                .andExpect(jsonPath("$.description").value("Morning yoga session"))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()));
    }
    @Test
    @DisplayName("Should return 404 when session ID does not exist")
    @WithMockUser
    void testFindById_NotFound() throws Exception {
        mockMvc.perform(get("/api/session/{id}", 9999L))
                .andExpect(status().isNotFound());
    }
    @Test
    @DisplayName("Should return 400 for invalid ID format")
    @WithMockUser
    void testFindById_BadRequest() throws Exception {
        mockMvc.perform(get("/api/session/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }
    // ===== FIND ALL TESTS =====
    @Test
    @DisplayName("Should return all sessions")
    @WithMockUser
    void testFindAll_Success() throws Exception {
        // Create another session
        Session session2 = Session.builder()
                .name("Evening Yoga")
                .date(new Date())
                .description("Evening yoga session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();
        sessionRepository.save(session2);
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Yoga Session")))
                .andExpect(jsonPath("$[1].name", is("Evening Yoga")));
    }
    @Test
    @DisplayName("Should return empty list when no sessions exist")
    @WithMockUser
    void testFindAll_EmptyList() throws Exception {
        sessionRepository.deleteAll();
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
    // ===== CREATE SESSION TESTS =====
    @Test
    @DisplayName("Should create session successfully")
    @WithMockUser
    void testCreate_Success() throws Exception {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("New Yoga Session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("New session description");
        sessionDto.setTeacher_id(teacher.getId());
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Yoga Session"))
                .andExpect(jsonPath("$.description").value("New session description"))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()));
    }
    @Test
    @DisplayName("Should return 400 when creating session with blank name")
    @WithMockUser
    void testCreate_BlankName_BadRequest() throws Exception {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("Description");
        sessionDto.setTeacher_id(teacher.getId());
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isBadRequest());
    }
    // ===== UPDATE SESSION TESTS =====
    @Test
    @DisplayName("Should update session successfully")
    @WithMockUser
    void testUpdate_Success() throws Exception {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Updated Yoga Session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("Updated description");
        sessionDto.setTeacher_id(teacher.getId());
        mockMvc.perform(put("/api/session/{id}", testSession.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Yoga Session"))
                .andExpect(jsonPath("$.description").value("Updated description"));
    }
    @Test
    @DisplayName("Should return 400 for invalid ID format when updating")
    @WithMockUser
    void testUpdate_BadRequest() throws Exception {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName("Updated Session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("Description");
        sessionDto.setTeacher_id(teacher.getId());
        mockMvc.perform(put("/api/session/{id}", "invalid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isBadRequest());
    }
    // ===== DELETE SESSION TESTS =====
    @Test
    @DisplayName("Should delete session successfully")
    @WithMockUser
    void testDelete_Success() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", testSession.getId()))
                .andExpect(status().isOk());
        // Verify deletion
        assert sessionRepository.findById(testSession.getId()).isEmpty();
    }
    @Test
    @DisplayName("Should return 404 when deleting non-existent session")
    @WithMockUser
    void testDelete_NotFound() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", 9999L))
                .andExpect(status().isNotFound());
    }
    @Test
    @DisplayName("Should return 400 for invalid ID format when deleting")
    @WithMockUser
    void testDelete_BadRequest() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }
    // ===== PARTICIPATE TESTS =====
    @Test
    @DisplayName("Should allow user to participate in session")
    @WithMockUser
    void testParticipate_Success() throws Exception {
        mockMvc.perform(post("/api/session/{id}/participate/{userId}",
                        testSession.getId(), testUser.getId()))
                .andExpect(status().isOk());
        // Verify participation
        Session updatedSession = sessionRepository.findById(testSession.getId()).orElse(null);
        assert updatedSession != null;
        assert updatedSession.getUsers().size() == 1;
        assert updatedSession.getUsers().get(0).getId().equals(testUser.getId());
    }
    @Test
    @DisplayName("Should return 400 for invalid session ID when participating")
    @WithMockUser
    void testParticipate_BadRequest() throws Exception {
        mockMvc.perform(post("/api/session/{id}/participate/{userId}",
                        "invalid", testUser.getId()))
                .andExpect(status().isBadRequest());
    }
    // ===== NO LONGER PARTICIPATE TESTS =====
    @Test
    @DisplayName("Should allow user to stop participating in session")
    @WithMockUser
    void testNoLongerParticipate_Success() throws Exception {
        // First add user to session
        testSession.getUsers().add(testUser);
        sessionRepository.save(testSession);
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}",
                        testSession.getId(), testUser.getId()))
                .andExpect(status().isOk());
        // Verify user is removed
        Session updatedSession = sessionRepository.findById(testSession.getId()).orElse(null);
        assert updatedSession != null;
        assert updatedSession.getUsers().isEmpty();
    }
    @Test
    @DisplayName("Should return 400 for invalid session ID when unparticipating")
    @WithMockUser
    void testNoLongerParticipate_BadRequest() throws Exception {
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}",
                        "invalid", testUser.getId()))
                .andExpect(status().isBadRequest());
    }
}
