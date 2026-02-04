package com.openclassrooms.starterjwt.security.jwt;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

import java.lang.reflect.Field;
import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for JwtUtils")
class JwtUtilsTest {

    private JwtUtils jwtUtils;

    private final String secret = "testSecretKey";

    @BeforeEach
    void setUp() throws Exception {
        jwtUtils = new JwtUtils();
        // set private fields via reflection
        Field secretField = JwtUtils.class.getDeclaredField("jwtSecret");
        secretField.setAccessible(true);
        secretField.set(jwtUtils, secret);

        Field expField = JwtUtils.class.getDeclaredField("jwtExpirationMs");
        expField.setAccessible(true);
        expField.setInt(jwtUtils, 3600000); // 1 hour
    }

    @Test
    @DisplayName("generateJwtToken should create a valid token and be parsable")
    void testGenerateAndParseToken() {
        UserDetailsImpl user = UserDetailsImpl.builder()
            .id(1L)
            .username("test@test.com")
            .password("pwd")
            .firstName("John")
            .lastName("Doe")
            .admin(false)
            .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(user);

        String token = jwtUtils.generateJwtToken(auth);
        assertNotNull(token, "Token should not be null");

        // validate and extract username
        assertTrue(jwtUtils.validateJwtToken(token), "Token should be valid");
        assertEquals("test@test.com", jwtUtils.getUserNameFromJwtToken(token));
    }

    @Test
    @DisplayName("validateJwtToken returns false for token with invalid signature")
    void testValidateToken_InvalidSignature() {
        // create token signed with different secret
        String badToken = Jwts.builder()
            .setSubject("someone@test.com")
            .setIssuedAt(new Date())
            .setExpiration(new Date((new Date()).getTime() + 10000))
            .signWith(SignatureAlgorithm.HS512, "otherSecret")
            .compact();

        assertFalse(jwtUtils.validateJwtToken(badToken), "Token signed with different secret should be invalid");
    }

    @Test
    @DisplayName("validateJwtToken returns false for malformed token")
    void testValidateToken_Malformed() {
        assertFalse(jwtUtils.validateJwtToken("this.is.not.a.jwt"), "Malformed token should be invalid");
    }

    @Test
    @DisplayName("validateJwtToken returns false for expired token")
    void testValidateToken_Expired() {
        String expired = Jwts.builder()
            .setSubject("expired@test.com")
            .setIssuedAt(new Date((new Date()).getTime() - 200000))
            .setExpiration(new Date((new Date()).getTime() - 100000))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();

        assertFalse(jwtUtils.validateJwtToken(expired), "Expired token should be invalid");
    }

    @Test
    @DisplayName("validateJwtToken returns false for empty token")
    void testValidateToken_Empty() {
        assertFalse(jwtUtils.validateJwtToken(""), "Empty token should be invalid");
    }
}
