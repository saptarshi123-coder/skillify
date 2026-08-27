package com.skillify.backend.controllers;

import com.skillify.backend.models.ApiResponse;
import com.skillify.backend.models.Internship;
import com.skillify.backend.models.InternshipApplication;
import com.skillify.backend.services.DatabaseService;
import com.skillify.backend.utils.CorsHandler;
import com.skillify.backend.utils.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller handling Internship Search, Listings, and Student Applications.
 */
public class InternshipController implements HttpHandler {
    private final DatabaseService db = DatabaseService.getInstance();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsHandler.handlePreflight(exchange)) return;

        URI uri = exchange.getRequestURI();
        String path = uri.getPath();
        String method = exchange.getRequestMethod();

        if ("GET".equalsIgnoreCase(method)) {
            if (path.endsWith("/applications")) {
                List<InternshipApplication> apps = db.getUserApplications("all");
                CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Applications fetched", apps));
                return;
            }

            Map<String, String> queryParams = parseQueryParams(uri.getQuery());
            String domain = queryParams.getOrDefault("domain", "all");
            String search = queryParams.getOrDefault("search", "");

            List<Internship> list = db.getAllInternships(domain, search);
            CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Internships fetched successfully", list));
        } else if ("POST".equalsIgnoreCase(method)) {
            // Apply for internship
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);

                Map<String, Object> body = JsonUtils.parseMap(sb.toString());
                String internshipId = String.valueOf(body.getOrDefault("internshipId", ""));
                String userId = String.valueOf(body.getOrDefault("userId", "usr_guest"));
                String applicantName = String.valueOf(body.getOrDefault("applicantName", "Guest Student"));
                String email = String.valueOf(body.getOrDefault("email", "guest@skillify.ai"));
                String resumeUrl = String.valueOf(body.getOrDefault("resumeUrl", ""));

                InternshipApplication app = new InternshipApplication(
                        null,
                        internshipId,
                        userId,
                        applicantName,
                        email,
                        resumeUrl,
                        "Submitted",
                        null
                );

                db.applyInternship(app);
                CorsHandler.sendJsonResponse(exchange, 201, ApiResponse.success("Internship application submitted successfully", app));
            } catch (Exception e) {
                CorsHandler.sendJsonResponse(exchange, 400, ApiResponse.error("Failed to submit application: " + e.getMessage()));
            }
        } else {
            CorsHandler.sendJsonResponse(exchange, 405, ApiResponse.error("Method Not Allowed"));
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> params = new HashMap<>();
        if (query == null || query.isEmpty()) return params;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                params.put(kv[0], kv[1]);
            } else if (kv.length == 1) {
                params.put(kv[0], "");
            }
        }
        return params;
    }
}
