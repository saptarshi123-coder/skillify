package com.skillify.backend;

import com.skillify.backend.controllers.*;
import com.skillify.backend.models.ApiResponse;
import com.skillify.backend.utils.CorsHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

/**
 * ============================================================================
 * Skillify AI - Discrete Java Backend Server
 * ============================================================================
 * High-performance, multithreaded REST API microservice implemented in Java 24.
 *
 * Provides REST API endpoints for:
 * - User Profiles, XP & Streak Tracking (/api/users/profile)
 * - Internship Listings & Student Applications (/api/internships)
 * - Portfolio Projects & Community Showcase (/api/projects)
 * - Skill Verification Records (/api/skills)
 * - Gateway & Health Monitoring (/api/health)
 *
 * Runs on Port 8080.
 */
public class SkillifyBackendServer {
    public static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        String portEnv = System.getenv("PORT");
        if (portEnv != null && !portEnv.isEmpty()) {
            try {
                port = Integer.parseInt(portEnv);
            } catch (NumberFormatException ignored) {}
        }

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // Register REST API Route Handlers
            server.createContext("/api/health", new AIProxyController());
            server.createContext("/api/users/profile", new UserController());
            server.createContext("/api/internships", new InternshipController());
            server.createContext("/api/projects", new ProjectController());
            server.createContext("/api/skills", new SkillController());

            // Root Welcome Handler
            server.createContext("/", exchange -> {
                if (CorsHandler.handlePreflight(exchange)) return;
                Map<String, Object> welcome = new HashMap<>();
                welcome.put("service", "Skillify AI Java Backend");
                welcome.put("version", "1.0.0");
                welcome.put("language", "Java (JDK 24)");
                welcome.put("status", "ACTIVE");
                CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Skillify Java Backend is running", welcome));
            });

            // Multi-threaded executor for handling concurrent client requests
            server.setExecutor(Executors.newFixedThreadPool(24));
            server.start();

            System.out.println("==========================================================");
            System.out.println(" Skillify AI - Java Backend Server Started Successfully");
            System.out.println(" Listening on: http://localhost:" + port);
            System.out.println(" Health Check: http://localhost:" + port + "/api/health");
            System.out.println(" Language:     Java 24 (Discrete Backend Architecture)");
            System.out.println("==========================================================");

        } catch (IOException e) {
            System.err.println("Failed to start Java backend server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
