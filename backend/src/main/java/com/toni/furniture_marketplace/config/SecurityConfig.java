package com.toni.furniture_marketplace.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF: we are a stateless JSON API, not a form-based app.
                .csrf(csrf -> csrf.disable())
                // Use the CorsConfigurationSource bean from WebConfig.
                .cors(Customizer.withDefaults())
                // Allow the H2 console to render in a frame.
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .authorizeHttpRequests(auth -> auth
                        // public: browsing, the H2 console, hello, expressing interest, registering
                        .requestMatchers("/hello", "/h2-console/**", "/error").permitAll()
                        // public: static assets (placeholder furniture images live under static/images/)
                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/furniture/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/furniture/*/interest").permitAll()
                        // public: the open "Sell an item" flow (no auth) — list an item and upload its image
                        .requestMatchers(HttpMethod.POST, "/api/furniture").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/uploads").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/sellers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sellers/**").permitAll()
                        // everything else (updating/deleting listings) needs login
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails seller = User.withUsername("seller")
                .password(encoder.encode("password"))
                .roles("SELLER")
                .build();
        return new InMemoryUserDetailsManager(seller);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
