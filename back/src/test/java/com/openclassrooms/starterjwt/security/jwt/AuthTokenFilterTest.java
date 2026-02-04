package com.openclassrooms.starterjwt.security.jwt;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for AuthTokenFilter")
class AuthTokenFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();
    }

    @Test
    @DisplayName("doFilterInternal should authenticate user with valid JWT token")
    void testDoFilterInternal_ValidToken() throws ServletException, IOException {
        // Given
        String jwt = "valid.jwt.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn("test@example.com");
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(userDetails);

        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtils).validateJwtToken(jwt);
        verify(jwtUtils).getUserNameFromJwtToken(jwt);
        verify(userDetailsService).loadUserByUsername("test@example.com");
        verify(filterChain).doFilter(request, response);
        
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("test@example.com", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    @DisplayName("doFilterInternal should not authenticate with invalid JWT token")
    void testDoFilterInternal_InvalidToken() throws ServletException, IOException {

        String jwt = "invalid.jwt.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(false);


        authTokenFilter.doFilterInternal(request, response, filterChain);


        verify(jwtUtils).validateJwtToken(jwt);
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("doFilterInternal should not authenticate when no Authorization header")
    void testDoFilterInternal_NoAuthorizationHeader() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn(null);

        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("doFilterInternal should not authenticate when Authorization header doesn't start with Bearer")
    void testDoFilterInternal_InvalidAuthorizationHeader() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Basic sometoken");

        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("doFilterInternal should continue filter chain even on exception")
    void testDoFilterInternal_ExceptionHandling() throws ServletException, IOException {
        // Given
        String jwt = "valid.jwt.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn("test@example.com");
        when(userDetailsService.loadUserByUsername("test@example.com"))
                .thenThrow(new RuntimeException("Database error"));

        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("doFilterInternal should handle empty Authorization header")
    void testDoFilterInternal_EmptyAuthorizationHeader() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("");

        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(request, response);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("doFilterInternal should handle Bearer with no token")
    void testDoFilterInternal_BearerWithNoToken() throws ServletException, IOException {
        // Given
        when(request.getHeader("Authorization")).thenReturn("Bearer ");
        when(jwtUtils.validateJwtToken("")).thenReturn(false);

        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtils).validateJwtToken("");
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);
        
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("doFilterInternal should extract token correctly from Bearer header")
    void testDoFilterInternal_TokenExtraction() throws ServletException, IOException {
        // Given
        String jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + jwt);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn("user@test.com");
        when(userDetailsService.loadUserByUsername("user@test.com")).thenReturn(userDetails);

        // When
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtils).validateJwtToken(jwt);
        verify(jwtUtils).getUserNameFromJwtToken(jwt);
    }
}
