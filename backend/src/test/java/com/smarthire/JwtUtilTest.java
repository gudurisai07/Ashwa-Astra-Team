package com.smarthire;

import com.smarthire.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {
    private static final String SECRET = "unit-test-secret-unit-test-secret-0123456789";

    @Test
    void generatesAndParsesToken() {
        JwtUtil jwt = new JwtUtil(SECRET, 60_000);
        String token = jwt.generateToken("a@b.test", "RECRUITER");
        assertTrue(jwt.isValid(token));
        Claims claims = jwt.parse(token);
        assertEquals("a@b.test", claims.getSubject());
        assertEquals("RECRUITER", claims.get("role", String.class));
    }

    @Test
    void rejectsTamperedToken() {
        JwtUtil jwt = new JwtUtil(SECRET, 60_000);
        String token = jwt.generateToken("a@b.test", "CANDIDATE");
        assertFalse(jwt.isValid(token + "x"));
        assertFalse(new JwtUtil("another-secret-another-secret-0123456789", 60_000).isValid(token));
    }

    @Test
    void rejectsShortSecret() {
        assertThrows(IllegalStateException.class, () -> new JwtUtil("short", 1000));
    }
}
