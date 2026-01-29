package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController
 * Testing authentication and registration endpoints using MockMvc with H2 database
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Test for Auth controller")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    private LoginRequest loginRequest;
    private SignupRequest signupRequest;

    @BeforeEach
    void setUp() {
        // Clean database before each test
        userRepository.deleteAll();

        // Setup login request
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password123");

        // Setup signup request
        signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@test.com");
        signupRequest.setFirstName("Jane");
        signupRequest.setLastName("Smith");
        signupRequest.setPassword("password123");
    }

    // ===== AUTHENTICATE USER TESTS =====

    @Test
    @DisplayName("Should authenticate user successfully and return JWT token")
    void testAuthenticateUser_Success() throws Exception {
        // Given - Create a real user in the database
        User user = User.builder()
                .email("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password(passwordEncoder.encode("password123"))
                .admin(false)
                .build();
        userRepository.save(user);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.username").value("test@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.admin").value(false));
    }

    @Test
    @DisplayName("Should authenticate admin user successfully with admin flag true")
    void testAuthenticateUser_AdminUser_Success() throws Exception {
        // Given - Create a real admin user in the database
        User adminUser = User.builder()
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("User")
                .password(passwordEncoder.encode("password123"))
                .admin(true)
                .build();
        userRepository.save(adminUser);

        loginRequest.setEmail("admin@test.com");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.admin").value(true));
    }

    @Test
    @DisplayName("Should return 401 when user credentials are invalid")
    void testAuthenticateUser_InvalidCredentials_Unauthorized() throws Exception {
        // Given - Create a user with different password
        User user = User.builder()
                .email("test@test.com")
                .firstName("John")
                .lastName("Doe")
                .password(passwordEncoder.encode("differentpassword"))
                .admin(false)
                .build();
        userRepository.save(user);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 400 when login request has blank email")
    void testAuthenticateUser_BlankEmail_BadRequest() throws Exception {
        // Given
        loginRequest.setEmail("");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when login request has blank password")
    void testAuthenticateUser_BlankPassword_BadRequest() throws Exception {
        // Given
        loginRequest.setPassword("");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    // ===== REGISTER USER TESTS =====

    @Test
    @DisplayName("Should register new user successfully")
    void testRegisterUser_Success() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        // Verify user was saved in database
        User savedUser = userRepository.findByEmail(signupRequest.getEmail()).orElse(null);
        assert savedUser != null;
        assert savedUser.getFirstName().equals("Jane");
        assert savedUser.getLastName().equals("Smith");
        assert !savedUser.isAdmin();
    }

    @Test
    @DisplayName("Should return error when email already exists")
    void testRegisterUser_EmailAlreadyExists_BadRequest() throws Exception {
        // Given - Create a user with the same email
        User existingUser = User.builder()
                .email(signupRequest.getEmail())
                .firstName("John")
                .lastName("Doe")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        userRepository.save(existingUser);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
    }

    @Test
    @DisplayName("Should return 400 when signup request has invalid email")
    void testRegisterUser_InvalidEmail_BadRequest() throws Exception {
        // Given
        signupRequest.setEmail("invalid-email");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when signup request has blank email")
    void testRegisterUser_BlankEmail_BadRequest() throws Exception {
        // Given
        signupRequest.setEmail("");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when signup request has blank first name")
    void testRegisterUser_BlankFirstName_BadRequest() throws Exception {
        // Given
        signupRequest.setFirstName("");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when signup request has blank last name")
    void testRegisterUser_BlankLastName_BadRequest() throws Exception {
        // Given
        signupRequest.setLastName("");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when signup request has short password")
    void testRegisterUser_ShortPassword_BadRequest() throws Exception {
        // Given
        signupRequest.setPassword("12345"); // Less than 6 characters

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when signup request has short first name")
    void testRegisterUser_ShortFirstName_BadRequest() throws Exception {
        // Given
        signupRequest.setFirstName("Jo"); // Less than 3 characters

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when signup request has short last name")
    void testRegisterUser_ShortLastName_BadRequest() throws Exception {
        // Given
        signupRequest.setLastName("Sm"); // Less than 3 characters

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest());
    }
}



