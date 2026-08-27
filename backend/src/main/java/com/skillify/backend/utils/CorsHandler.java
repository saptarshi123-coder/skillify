package com.skillify.backend.utils;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Utility for handling Cross-Origin Resource Sharing (CORS) and standard HTTP JSON responses.
 */
public class CorsHandler {

    public static void applyCors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning");
        exchange.getResponseHeaders().set("Access-Control-Max-Age", "86400");
    }

    public static boolean handlePreflight(HttpExchange exchange) throws IOException {
        applyCors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return true;
        }
        return false;
    }

    public static void sendJsonResponse(HttpExchange exchange, int statusCode, Object responseBody) throws IOException {
        applyCors(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        String json = JsonUtils.toJson(responseBody);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
