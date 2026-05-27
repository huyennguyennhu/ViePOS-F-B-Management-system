package com.viepos.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/ping", "/error").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/admin/register").permitAll()
                .requestMatchers("/api/staff/login", "/api/staff/register").permitAll()
                // Tự phục vụ PIN (POS)
                .requestMatchers(
                        "/api/staff/verify-pin",
                        "/api/staff/pin-change-request",
                        "/api/staff/forgot-pin"
                ).hasRole("STAFF")
                // Quản lý — Tạm thời cấp quyền cho STAFF (Manager/Cashier) để hỗ trợ phân quyền frontend
                .requestMatchers(
                        "/api/staff/all",
                        "/api/staff/pending",
                        "/api/staff/history/**",
                        "/api/staff/pin-change-requests/**",
                        "/api/staff/pin-reset-requests/**"
                ).hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/staff/*/approve").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/staff/*/reject").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/staff").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/staff/*").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/staff/*").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers("/api/inventory/**").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/products").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/*").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/*").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/categories").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/*").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/*").hasAnyRole("STAFF", "ADMIN", "ROOT_ADMIN")
                // POS + đọc dữ liệu: STAFF, ADMIN, ROOT_ADMIN (đã đăng nhập)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*", 
            "http://127.0.0.1:*",
            "https://molten-gasket-434712-c8.web.app",
            "https://*.web.app",
            "https://vie-pos-f-b-management-system.vercel.app",
            "https://*.vercel.app",
            "https://console.cron-job.org",
            "https://*.cron-job.org"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
