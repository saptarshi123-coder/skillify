package com.skillify.backend.controllers;

import com.skillify.backend.models.ApiResponse;
import com.skillify.backend.utils.CorsHandler;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Gateway and Health Check controller connecting Java Backend to Python AI Microservices.
 */
public class AIProxyController implements HttpHandler {
    private static final String AI_CHATBOT_URL = "http://localhost:5001/api/health";
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (CorsHandler.handlePreflight(exchange)) return;

        Map<String, Object> status = new HashMap<>();
        status.put("backend", "Skillify Java Backend (Java 24)");
        status.put("backend_status", "ONLINE");
        status.put("port", 8080);

        boolean aiOnline = checkAIHealth();
        status.put("ai_microservice", aiOnline ? "ONLINE (Port 5001)" : "STANDALONE / LOCAL_FALLBACK");

        CorsHandler.sendJsonResponse(exchange, 200, ApiResponse.success("Skillify Backend Gateway Active", status));
    }

    private boolean checkAIHealth() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(AI_CHATBOT_URL))
                    .timeout(Duration.ofSeconds(2))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception ignored) {
            return false;
        }
    }
}
