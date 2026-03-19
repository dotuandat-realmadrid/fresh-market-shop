package com.dotuandat.thesis.freshmarket.configs;

import com.dotuandat.thesis.freshmarket.entities.Role;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.repositories.RoleRepository;
import com.dotuandat.thesis.freshmarket.repositories.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    @NonFinal
    static String ADMIN_USERNAME = "admin@gmail.com";

    @NonFinal
    static String ADMIN_PASSWORD = "admin";

    @NonFinal
    static String ADMIN_FULL_NAME = "ADMIN";

    @NonFinal
    static String ROLE_ADMIN_CODE = "ADMIN";

    @NonFinal
    static String ROLE_ADMIN_DESCRIPTION = "Admin role";

    PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner init(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {
            if (userRepository.existsByUsername(ADMIN_USERNAME))
                return;

            List<Role> roles = new ArrayList<>();

            if (roleRepository.existsByCode(ROLE_ADMIN_CODE)) {
                Role adminRole = roleRepository.findByCode("ADMIN");
                roles.add(adminRole);
            } else {
                Role adminRole = roleRepository.save(Role.builder()
                        .code(ROLE_ADMIN_CODE)
                        .description(ROLE_ADMIN_DESCRIPTION)
                        .build());

                roles.add(adminRole);
            }

            User user = User.builder()
                    .username(ADMIN_USERNAME)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .fullName(ADMIN_FULL_NAME)
                    .isActive((byte) 1)
                    .roles(roles)
                    .build();

            userRepository.save(user);
            log.warn("admin user has been created with default password: "
                    + ADMIN_PASSWORD + ", please change it");
        };
    }
}
