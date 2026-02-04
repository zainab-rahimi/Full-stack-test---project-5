package com.openclassrooms.starterjwt.security.services;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Collection;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

@DisplayName("Unit tests for UserDetailsImpl")
class UserDetailsImplTest {

    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password123")
                .admin(true)
                .build();
    }

    @Test
    @DisplayName("Should build UserDetailsImpl with all fields correctly")
    void testBuilder() {
        assertEquals(1L, userDetails.getId());
        assertEquals("test@example.com", userDetails.getUsername());
        assertEquals("John", userDetails.getFirstName());
        assertEquals("Doe", userDetails.getLastName());
        assertEquals("password123", userDetails.getPassword());
        assertEquals(true, userDetails.getAdmin());
    }

    @Test
    @DisplayName("getAuthorities should return empty collection")
    void testGetAuthorities() {
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        assertNotNull(authorities);
        assertTrue(authorities.isEmpty());
    }

    @Test
    @DisplayName("isAccountNonExpired should always return true")
    void testIsAccountNonExpired() {
        assertTrue(userDetails.isAccountNonExpired());
    }

    @Test
    @DisplayName("isAccountNonLocked should always return true")
    void testIsAccountNonLocked() {
        assertTrue(userDetails.isAccountNonLocked());
    }

    @Test
    @DisplayName("isCredentialsNonExpired should always return true")
    void testIsCredentialsNonExpired() {
        assertTrue(userDetails.isCredentialsNonExpired());
    }

    @Test
    @DisplayName("isEnabled should always return true")
    void testIsEnabled() {
        assertTrue(userDetails.isEnabled());
    }

    @Test
    @DisplayName("equals should return true for same object")
    void testEquals_SameObject() {
        assertTrue(userDetails.equals(userDetails));
    }

    @Test
    @DisplayName("equals should return true for objects with same id")
    void testEquals_SameId() {
        UserDetailsImpl other = UserDetailsImpl.builder()
                .id(1L)
                .username("different@example.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("differentPassword")
                .admin(false)
                .build();
        
        assertTrue(userDetails.equals(other));
    }

    @Test
    @DisplayName("equals should return false for objects with different id")
    void testEquals_DifferentId() {
        UserDetailsImpl other = UserDetailsImpl.builder()
                .id(2L)
                .username("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password123")
                .admin(true)
                .build();
        
        assertFalse(userDetails.equals(other));
    }

    @Test
    @DisplayName("equals should return false when comparing with null")
    void testEquals_Null() {
        assertFalse(userDetails.equals(null));
    }

    @Test
    @DisplayName("equals should return false when comparing with different class")
    void testEquals_DifferentClass() {
        String differentObject = "Not a UserDetailsImpl";
        assertFalse(userDetails.equals(differentObject));
    }

    @Test
    @DisplayName("Should handle null admin field")
    void testNullAdmin() {
        UserDetailsImpl userWithNullAdmin = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password123")
                .admin(null)
                .build();
        
        assertNull(userWithNullAdmin.getAdmin());
    }

    @Test
    @DisplayName("Should build UserDetailsImpl with admin false")
    void testAdminFalse() {
        UserDetailsImpl regularUser = UserDetailsImpl.builder()
                .id(2L)
                .username("user@example.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("userpass")
                .admin(false)
                .build();
        
        assertEquals(false, regularUser.getAdmin());
    }
}
