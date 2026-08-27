package com.skillify.backend.controllers;

import com.skillify.backend.models.ApiResponse;
import com.skillify.backend.models.User;
import com.skillify.backend.services.DatabaseService;
import com.skillify.backend.utils.CorsHandler;
import com.skillify.backend.utils.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Controller handling User Profile, Levels, XP, and Streaks.
 */
public class UserController implements HttpHandler {
    private final DatabaseService db = DatabaseService.getInstance();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsHandler.handlePreflight(exchange)) return;

        String method = exchange.getRequestMethod();

        if ("GET".equalsIgnoreCase(method)) {
            User user = db.getCurrentUser();
            CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Profile fetched successfully", user));
        } else if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);

                Map<String, Object> body = JsonUtils.parseMap(sb.toString());
                User user = db.getCurrentUser();

                if (body.containsKey("name")) user.setName(String.valueOf(body.get("name")));
                if (body.containsKey("email")) user.setEmail(String.valueOf(body.get("email")));
                if (body.containsKey("avatar")) user.setAvatar(String.valueOf(body.get("avatar")));
                if (body.containsKey("level") && body.get("level") instanceof Number) {
                    user.setLevel(((Number) body.get("level")).intValue());
                }
                if (body.containsKey("xp") && body.get("xp") instanceof Number) {
                    user.setXp(((Number) body.get("xp")).intValue());
                }
                if (body.containsKey("streak") && body.get("streak") instanceof Number) {
                    user.setStreak(((Number) body.get("streak")).intValue());
                }

                db.updateCurrentUser(user);
                CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Profile updated successfully", user));
            } catch (Exception e) {
                CorsHandler.sendJsonResponse(exchange, 400, ApiResponse.error("Failed to parse request: " + e.getMessage()));
            }
        } else {
            CorsHandler.sendJsonResponse(exchange, 405, ApiResponse.error("Method Not Allowed"));
        }
    }
}
