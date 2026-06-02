package com.saec;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGeneratorTest {

    @Test
    void gen() {
        System.out.println(">>>HASH:" + new BCryptPasswordEncoder(12).encode("Saec2026!"));
    }
}
