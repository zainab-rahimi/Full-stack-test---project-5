package com.openclassrooms.starterjwt.controllers;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
/**
 * Integration tests for UserController using H2 database
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("User Controller Integration Tests")
class UserControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    private User testUser;
    private User adminUser;
    @BeforeEach
    void setUp() {
        // Clean database
        userRepository.deleteAll();
        // Create regular test user
        testUser = User.builder()
                .email("user@test.com")
                .firstName("John")
                .lastName("Doe")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        testUser = userRepository.save(testUser);
        // Create admin user
        adminUser = User.builder()
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("User")
                .password(passwordEncoder.encode("password"))
                .admin(true)
                .build();
        adminUser = userRepository.save(adminUser);
    }
    // ===== FIND BY ID TESTS =====
    @Test
    @DisplayName("Should return user when ID exists")
    @WithMockUser
    void testFindById_Success() throws Exception {
        mockMvc.perform(get("/api/user/{id}", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.admin").value(false));
    }
    @Test
    @DisplayName("Should return 404 when user ID does not exist")
    @WithMockUser
    void testFindById_NotFound() throws Exception {
        mockMvc.perform(get("/api/user/{id}", 9999L))
                .andExpect(status().isNotFound());
    }
    @Test
    @DisplayName("Should return 400 for invalid ID format")
    @WithMockUser
    void testFindById_BadRequest() throws Exception {
        mockMvc.perform(get("/api/user/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }
    @Test
    @DisplayName("Should return admin user with admin flag true")
    @WithMockUser
    void testFindById_AdminUser() throws Exception {
        mockMvc.perform(get("/api/user/{id}", adminUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@test.com"))
                .andExpect(jsonPath("$.admin").value(true));
    }
    // ===== DELETE USER TESTS =====
    @Test
    @DisplayName("Should delete user when user is authenticated as themselves")
    @WithMockUser(username = "user@test.com")
    void testDelete_Success() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", testUser.getId()))
                .andExpect(status().isOk());
        // Verify deletion
        assert userRepository.findById(testUser.getId()).isEmpty();
    }
    @Test
    @DisplayName("Should return 401 when trying to delete another user")
    @WithMockUser(username = "other@test.com")
    void testDelete_Unauthorized() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", testUser.getId()))
                .andExpect(status().isUnauthorized());
        // Verify user was not deleted
        assert userRepository.findById(testUser.getId()).isPresent();
    }
    @Test
    @DisplayName("Should return 404 when deleting non-existent user")
    @WithMockUser(username = "user@test.com")
    void testDelete_NotFound() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", 9999L))
                .andExpect(status().isNotFound());
    }
    @Test
    @DisplayName("Should return 400 for invalid ID format when deleting")
    @WithMockUser(username = "user@test.com")
    void testDelete_BadRequest() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }
    @Test
    @DisplayName("Should return 401 when admin tries to delete regular user")
    @WithMockUser(username = "admin@test.com")
    void testDelete_AdminCannotDeleteOtherUser() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", testUser.getId()))
                .andExpect(status().isUnauthorized());
        // Verify user was not deleted
        assert userRepository.findById(testUser.getId()).isPresent();
    }
    @Test
    @DisplayName("Should delete admin user when admin is authenticated as themselves")
    @WithMockUser(username = "admin@test.com")
    void testDelete_AdminDeletesSelf() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", adminUser.getId()))
                .andExpect(status().isOk());
        // Verify deletion
        assert userRepository.findById(adminUser.getId()).isEmpty();
    }
}
