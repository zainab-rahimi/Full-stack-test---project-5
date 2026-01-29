package com.openclassrooms.starterjwt.services;
import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDateTime;
import java.util.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
/**
 * Unit tests for SessionService
 * Testing all CRUD operations and participation management with Mockito
 */
@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {
    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private SessionService sessionService;
    private Session session1;
    private Session session2;
    private User user1;
    private User user2;
    private Teacher teacher;
    @BeforeEach
    public void setUp() {
        // Initialize test data before each test
        teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        user1 = User.builder()
                .id(1L)
                .email("user1@test.com")
                .firstName("Alice")
                .lastName("Smith")
                .password("password123")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        user2 = User.builder()
                .id(2L)
                .email("user2@test.com")
                .firstName("Bob")
                .lastName("Johnson")
                .password("password456")
                .admin(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        session1 = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .date(new Date())
                .description("Morning yoga session")
                .teacher(teacher)
                .users(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        session2 = Session.builder()
                .id(2L)
                .name("Meditation Session")
                .date(new Date())
                .description("Evening meditation")
                .teacher(teacher)
                .users(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
    // ===== CREATE TESTS =====
    @Test
    public void testCreate_ShouldSaveAndReturnSession() {
        // Given
        when(sessionRepository.save(session1)).thenReturn(session1);
        // When
        Session result = sessionService.create(session1);
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Yoga Session");
        verify(sessionRepository, times(1)).save(session1);
    }
    // ===== DELETE TESTS =====
    @Test
    public void testDelete_ShouldCallDeleteById() {
        // Given
        Long sessionId = 1L;
        doNothing().when(sessionRepository).deleteById(sessionId);
        // When
        sessionService.delete(sessionId);
        // Then
        verify(sessionRepository, times(1)).deleteById(sessionId);
    }
    // ===== FIND ALL TESTS
    @Test
    public void testFindAll_ShouldReturnAllSessions() {
        // Given
        List<Session> expectedSessions = Arrays.asList(session1, session2);
        when(sessionRepository.findAll()).thenReturn(expectedSessions);
        // When
        List<Session> result = sessionService.findAll();
        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(session1, session2);
        verify(sessionRepository, times(1)).findAll();
    }
    @Test
    public void testFindAll_ShouldReturnEmptyList_WhenNoSessions() {
        // Given
        when(sessionRepository.findAll()).thenReturn(Collections.emptyList());
        // When
        List<Session> result = sessionService.findAll();
        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(sessionRepository, times(1)).findAll();
    }
    // ===== GET BY ID TESTS =====
    @Test
    public void testGetById_ShouldReturnSession_WhenSessionExists() {
        // Given
        Long sessionId = 1L;
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session1));
        // When
        Session result = sessionService.getById(sessionId);
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(sessionId);
        assertThat(result.getName()).isEqualTo("Yoga Session");
        verify(sessionRepository, times(1)).findById(sessionId);
    }
    @Test
    public void testGetById_ShouldReturnNull_WhenSessionDoesNotExist() {
        // Given
        Long nonExistentId = 999L;
        when(sessionRepository.findById(nonExistentId)).thenReturn(Optional.empty());
        // When
        Session result = sessionService.getById(nonExistentId);
        // Then
        assertThat(result).isNull();
        verify(sessionRepository, times(1)).findById(nonExistentId);
    }
    // ===== UPDATE TESTS =====
    @Test
    public void testUpdate_ShouldUpdateAndReturnSession() {
        // Given
        Long sessionId = 1L;
        Session updatedSession = Session.builder()
                .name("Updated Yoga Session")
                .date(new Date())
                .description("Updated description")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build();
        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);
        // When
        Session result = sessionService.update(sessionId, updatedSession);
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Yoga Session");
        verify(sessionRepository, times(1)).save(any(Session.class));
    }
    // ===== PARTICIPATE TESTS =====
    @Test
    public void testParticipate_ShouldAddUserToSession_WhenValidRequest() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;
        session1.setUsers(new ArrayList<>());
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session1));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user1));
        when(sessionRepository.save(any(Session.class))).thenReturn(session1);
        // When
        sessionService.participate(sessionId, userId);
        // Then
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(userRepository, times(1)).findById(userId);
        verify(sessionRepository, times(1)).save(session1);
        assertThat(session1.getUsers()).contains(user1);
    }
    @Test
    public void testParticipate_ShouldThrowNotFoundException_WhenSessionDoesNotExist() {
        // Given
        Long sessionId = 999L;
        Long userId = 1L;
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user1));
        // When & Then
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(sessionRepository, never()).save(any(Session.class));
    }
    @Test
    public void testParticipate_ShouldThrowNotFoundException_WhenUserDoesNotExist() {
        // Given
        Long sessionId = 1L;
        Long userId = 999L;
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session1));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        // When & Then
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(userRepository, times(1)).findById(userId);
        verify(sessionRepository, never()).save(any(Session.class));
    }
    @Test
    public void testParticipate_ShouldThrowBadRequestException_WhenUserAlreadyParticipates() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;
        session1.setUsers(new ArrayList<>(Arrays.asList(user1)));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session1));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user1));
        // When & Then
        assertThatThrownBy(() -> sessionService.participate(sessionId, userId))
                .isInstanceOf(BadRequestException.class);
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(userRepository, times(1)).findById(userId);
        verify(sessionRepository, never()).save(any(Session.class));
    }
    // ===== NO LONGER PARTICIPATE TESTS =====
    @Test
    public void testNoLongerParticipate_ShouldRemoveUserFromSession_WhenValidRequest() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;
        session1.setUsers(new ArrayList<>(Arrays.asList(user1, user2)));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session1));
        when(sessionRepository.save(any(Session.class))).thenReturn(session1);
        // When
        sessionService.noLongerParticipate(sessionId, userId);
        // Then
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(sessionRepository, times(1)).save(session1);
        assertThat(session1.getUsers()).doesNotContain(user1);
        assertThat(session1.getUsers()).contains(user2);
    }
    @Test
    public void testNoLongerParticipate_ShouldThrowNotFoundException_WhenSessionDoesNotExist() {
        // Given
        Long sessionId = 999L;
        Long userId = 1L;
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());
        // When & Then
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, userId))
                .isInstanceOf(NotFoundException.class);
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(sessionRepository, never()).save(any(Session.class));
    }
    @Test
    public void testNoLongerParticipate_ShouldThrowBadRequestException_WhenUserNotParticipating() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;
        session1.setUsers(new ArrayList<>(Arrays.asList(user2))); // Only user2 participating
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session1));
        // When & Then
        assertThatThrownBy(() -> sessionService.noLongerParticipate(sessionId, userId))
                .isInstanceOf(BadRequestException.class);
        verify(sessionRepository, times(1)).findById(sessionId);
        verify(sessionRepository, never()).save(any(Session.class));
    }
    @Test
    public void testNoLongerParticipate_ShouldRemoveOnlySpecifiedUser() {
        // Given
        Long sessionId = 1L;
        Long userId = 1L;
        User user3 = User.builder()
                .id(3L)
                .email("user3@test.com")
                .firstName("Charlie")
                .lastName("Brown")
                .password("password789")
                .admin(false)
                .build();
        session1.setUsers(new ArrayList<>(Arrays.asList(user1, user2, user3)));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session1));
        when(sessionRepository.save(any(Session.class))).thenReturn(session1);
        // When
        sessionService.noLongerParticipate(sessionId, userId);
        // Then
        assertThat(session1.getUsers()).hasSize(2);
        assertThat(session1.getUsers()).doesNotContain(user1);
        assertThat(session1.getUsers()).containsExactlyInAnyOrder(user2, user3);
        verify(sessionRepository, times(1)).save(session1);
    }
}
