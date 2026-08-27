package com.skillify.backend.controllers;

import com.skillify.backend.models.ApiResponse;
import com.skillify.backend.models.Project;
import com.skillify.backend.services.DatabaseService;
import com.skillify.backend.utils.CorsHandler;
import com.skillify.backend.utils.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Controller handling Student Projects and Community Showcase.
 */
public class ProjectController implements HttpHandler {
    private final DatabaseService db = DatabaseService.getInstance();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsHandler.handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod();

        if ("GET".equalsIgnoreCase(method)) {
            List<Project> list = db.getAllProjects();
            CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Projects fetched successfully", list));
        } else if ("POST".equalsIgnoreCase(method)) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);

                Map<String, Object> body = JsonUtils.parseMap(sb.toString());
                String title = String.valueOf(body.getOrDefault("title", ""));
                String description = String.valueOf(body.getOrDefault("description", ""));
                String category = String.valueOf(body.getOrDefault("category", "General"));
                String repoUrl = String.valueOf(body.getOrDefault("repoUrl", ""));
                String liveUrl = String.valueOf(body.getOrDefault("liveUrl", ""));
                String authorName = String.valueOf(body.getOrDefault("authorName", "Student"));

                List<String> tags = new ArrayList<>();
                if (body.get("tags") instanceof List<?>) {
                    for (Object t : (List<?>) body.get("tags")) {
                        tags.add(String.valueOf(t));
                    }
                }

                Project project = new Project(
                        null,
                        title,
                        description,
                        category,
                        tags,
                        repoUrl,
                        liveUrl,
                        "usr_guest",
                        authorName,
                        0,
                        null
                );

                db.submitProject(project);
                CorsHandler.sendJsonResponse(exchange, 201, ApiResponse.success("Project submitted successfully", project));
            } catch (Exception e) {
                CorsHandler.sendJsonResponse(exchange, 400, ApiResponse.error("Failed to submit project: " + e.getMessage()));
            }
        } else {
            CorsHandler.sendJsonResponse(exchange, 405, ApiResponse.error("Method Not Allowed"));
        }
    }
}
