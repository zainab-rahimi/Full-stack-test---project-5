package com.openclassrooms.starterjwt.security.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for UserDetailsServiceImpl")
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password123")
                .admin(false)
                .build();
    }

    @Test
    @DisplayName("loadUserByUsername should return UserDetails when user exists")
    void testLoadUserByUsername_Success() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername("test@example.com");

        // Then
        assertNotNull(userDetails);
        assertEquals("test@example.com", userDetails.getUsername());
        assertEquals("password123", userDetails.getPassword());
        
        // Cast to UserDetailsImpl to check additional fields
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        assertEquals(1L, userDetailsImpl.getId());
        assertEquals("John", userDetailsImpl.getFirstName());
        assertEquals("Doe", userDetailsImpl.getLastName());
    }

    @Test
    @DisplayName("loadUserByUsername should throw UsernameNotFoundException when user does not exist")
    void testLoadUserByUsername_UserNotFound() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("nonexistent@example.com")
        );
        
        assertTrue(exception.getMessage().contains("User Not Found with email"));
        assertTrue(exception.getMessage().contains("nonexistent@example.com"));
    }

    @Test
    @DisplayName("loadUserByUsername should handle admin user correctly")
    void testLoadUserByUsername_AdminUser() {
        // Given
        User adminUser = User.builder()
                .id(2L)
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .password("adminpass")
                .admin(true)
                .build();
        
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername("admin@example.com");

        // Then
        assertNotNull(userDetails);
        assertEquals("admin@example.com", userDetails.getUsername());
        assertEquals("adminpass", userDetails.getPassword());
        
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        assertEquals(2L, userDetailsImpl.getId());
        assertEquals("Admin", userDetailsImpl.getFirstName());
        assertEquals("User", userDetailsImpl.getLastName());
    }

    @Test
    @DisplayName("loadUserByUsername should preserve all user fields")
    void testLoadUserByUsername_PreservesAllFields() {
        // Given
        User userWithAllFields = User.builder()
                .id(3L)
                .email("complete@example.com")
                .firstName("Complete")
                .lastName("User")
                .password("complexPassword123")
                .admin(false)
                .build();
        
        when(userRepository.findByEmail("complete@example.com")).thenReturn(Optional.of(userWithAllFields));

        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername("complete@example.com");

        // Then
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        assertEquals(3L, userDetailsImpl.getId());
        assertEquals("complete@example.com", userDetailsImpl.getUsername());
        assertEquals("Complete", userDetailsImpl.getFirstName());
        assertEquals("User", userDetailsImpl.getLastName());
        assertEquals("complexPassword123", userDetailsImpl.getPassword());
    }

    @Test
    @DisplayName("loadUserByUsername should handle different email formats")
    void testLoadUserByUsername_DifferentEmailFormats() {
        // Given
        String email = "user.with.dots+tag@subdomain.example.com";
        User userWithComplexEmail = User.builder()
                .id(4L)
                .email(email)
                .firstName("Complex")
                .lastName("Email")
                .password("pass")
                .admin(false)
                .build();
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(userWithComplexEmail));

        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        // Then
        assertNotNull(userDetails);
        assertEquals(email, userDetails.getUsername());
    }
}
