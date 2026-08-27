package com.skillify.backend.controllers;

import com.skillify.backend.models.ApiResponse;
import com.skillify.backend.models.Skill;
import com.skillify.backend.services.DatabaseService;
import com.skillify.backend.utils.CorsHandler;
import com.skillify.backend.utils.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Controller handling Skill Badges and Verification Records.
 */
public class SkillController implements HttpHandler {
    private final DatabaseService db = DatabaseService.getInstance();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsHandler.handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod();

        if ("GET".equalsIgnoreCase(method)) {
            List<Skill> skills = db.getUserSkills();
            CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Skills fetched successfully", skills));
        } else if ("POST".equalsIgnoreCase(method)) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);

                Map<String, Object> body = JsonUtils.parseMap(sb.toString());
                String skillName = String.valueOf(body.getOrDefault("skillName", "Python"));
                int level = body.get("level") instanceof Number ? ((Number) body.get("level")).intValue() : 1;

                db.verifySkill(skillName, level);
                CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Skill verified successfully", skillName));
            } catch (Exception e) {
                CorsHandler.sendJsonResponse(exchange, 400, ApiResponse.error("Failed to verify skill: " + e.getMessage()));
            }
        } else {
            CorsHandler.sendJsonResponse(exchange, 405, ApiResponse.error("Method Not Allowed"));
        }
    }
}
