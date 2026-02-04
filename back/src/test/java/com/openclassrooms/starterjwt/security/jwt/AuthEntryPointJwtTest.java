package com.openclassrooms.starterjwt.security.jwt;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.WriteListener;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for AuthEntryPointJwt")
class AuthEntryPointJwtTest {

    @InjectMocks
    private AuthEntryPointJwt authEntryPointJwt;

    private HttpServletRequest request;
    private HttpServletResponse response;
    private AuthenticationException authException;

    @BeforeEach
    void setUp() {
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        authException = new BadCredentialsException("Invalid credentials");
    }

    @Test
    @DisplayName("commence should set response status to 401 and write error details")
    void testCommence_Success() throws IOException, ServletException {
        // Given
        when(request.getServletPath()).thenReturn("/api/test");
        
        StringWriter stringWriter = new StringWriter();
        ServletOutputStream outputStream = new ServletOutputStream() {
            @Override
            public void write(int b) throws IOException {
                stringWriter.write(b);
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setWriteListener(WriteListener listener) {
            }
        };
        
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, authException);

        // Then
        verify(response).setContentType(MediaType.APPLICATION_JSON_VALUE);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        // Verify the JSON content
        String jsonResponse = stringWriter.toString();
        assertNotNull(jsonResponse);
        assertTrue(jsonResponse.contains("\"status\":401"));
        assertTrue(jsonResponse.contains("\"error\":\"Unauthorized\""));
        assertTrue(jsonResponse.contains("\"message\":\"Invalid credentials\""));
        assertTrue(jsonResponse.contains("\"path\":\"/api/test\""));
    }

    @Test
    @DisplayName("commence should handle different authentication exception messages")
    void testCommence_DifferentExceptionMessage() throws IOException, ServletException {
        // Given
        AuthenticationException customException = new BadCredentialsException("Custom error message");
        when(request.getServletPath()).thenReturn("/api/custom");
        
        StringWriter stringWriter = new StringWriter();
        ServletOutputStream outputStream = new ServletOutputStream() {
            @Override
            public void write(int b) throws IOException {
                stringWriter.write(b);
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setWriteListener(WriteListener listener) {
            }
        };
        
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, customException);

        // Then
        String jsonResponse = stringWriter.toString();
        assertTrue(jsonResponse.contains("\"message\":\"Custom error message\""));
        assertTrue(jsonResponse.contains("\"path\":\"/api/custom\""));
    }

    @Test
    @DisplayName("commence should handle different servlet paths")
    void testCommence_DifferentPaths() throws IOException, ServletException {
        // Given
        when(request.getServletPath()).thenReturn("/api/auth/login");
        
        StringWriter stringWriter = new StringWriter();
        ServletOutputStream outputStream = new ServletOutputStream() {
            @Override
            public void write(int b) throws IOException {
                stringWriter.write(b);
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setWriteListener(WriteListener listener) {
            }
        };
        
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, authException);

        // Then
        String jsonResponse = stringWriter.toString();
        assertTrue(jsonResponse.contains("\"path\":\"/api/auth/login\""));
    }
}
