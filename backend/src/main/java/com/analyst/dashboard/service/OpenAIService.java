package com.analyst.dashboard.service;

import com.analyst.dashboard.dto.QueryResponse;
import com.analyst.dashboard.model.Dataset;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenAIService {

    private static final Logger log = LoggerFactory.getLogger(OpenAIService.class);

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.model}")
    private String model;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final DataProcessingService dataProcessingService;

    public OpenAIService(ObjectMapper objectMapper, DataProcessingService dataProcessingService) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
        this.dataProcessingService = dataProcessingService;
    }

    public QueryResponse processNaturalLanguageQuery(String question, Dataset dataset) throws Exception {
        List<String> headers = objectMapper.readValue(
                dataset.getHeadersJson(), new TypeReference<List<String>>() {});

        // If no API key, use rule-based fallback
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("No OpenAI API key configured. Using rule-based query processing.");
            return processWithRules(question, dataset, headers);
        }

        // Build system prompt
        String systemPrompt = buildSystemPrompt(headers);

        // Call OpenAI
        String aiResponse = callOpenAI(systemPrompt, question);
        log.info("AI Response: {}", aiResponse);

        // Parse AI response into structured query
        return executeAIQuery(aiResponse, dataset, question);
    }

    private String buildSystemPrompt(List<String> headers) {
        return """
                You are a data analysis assistant. The user has a CSV dataset with these columns: %s
                
                When the user asks a question about the data, respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
                {
                    "operation": "SUM|AVG|COUNT|MIN|MAX|FILTER",
                    "column": "column_name",
                    "groupBy": "column_name_or_null",
                    "filterColumn": "column_name_or_null",
                    "filterValue": "value_or_null",
                    "chartType": "bar|line|pie|table"
                }
                
                Rules:
                - operation must be one of: SUM, AVG, COUNT, MIN, MAX, FILTER
                - column is the column to aggregate (use any column for COUNT)
                - groupBy is the column to group results by (null if not needed)
                - filterColumn and filterValue are for filtering rows (null if not needed)
                - chartType: use "bar" for comparisons, "line" for trends, "pie" for distributions, "table" for raw data
                - Respond with ONLY the JSON, nothing else
                """.formatted(String.join(", ", headers));
    }

    private String callOpenAI(String systemPrompt, String userMessage) throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("temperature", 0.1);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userMessage));
        requestBody.put("messages", messages);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        httpHeaders.setBearerAuth(apiKey);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), httpHeaders);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

        JsonNode responseJson = objectMapper.readTree(response.getBody());
        return responseJson.path("choices").get(0).path("message").path("content").asText();
    }

    private QueryResponse executeAIQuery(String aiResponse, Dataset dataset, String originalQuestion) throws Exception {
        // Clean the response (remove markdown code fences if present)
        String cleaned = aiResponse.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```json?\\s*", "").replaceAll("```\\s*$", "").trim();
        }

        JsonNode queryJson = objectMapper.readTree(cleaned);

        String operation = getJsonText(queryJson, "operation");
        String column = getJsonText(queryJson, "column");
        String groupBy = getJsonText(queryJson, "groupBy");
        String filterColumn = getJsonText(queryJson, "filterColumn");
        String filterValue = getJsonText(queryJson, "filterValue");
        String chartType = getJsonText(queryJson, "chartType");

        QueryResponse result = dataProcessingService.processQuery(
                dataset, operation, column, groupBy, filterColumn, filterValue);

        if (chartType != null && !chartType.isBlank()) {
            result.setChartType(chartType);
        }

        // Generate AI summary
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String summaryPrompt = "Based on this data analysis result, provide a brief 2-3 sentence summary in plain English. " +
                        "Original question: \"" + originalQuestion + "\"\n" +
                        "Result data: " + objectMapper.writeValueAsString(result.getData());

                String summary = callOpenAI("You are a helpful data analyst. Provide concise, insightful summaries.", summaryPrompt);
                result.setSummary(summary);
            } catch (Exception e) {
                log.error("Failed to generate AI summary", e);
            }
        }

        return result;
    }

    private QueryResponse processWithRules(String question, Dataset dataset, List<String> headers) throws Exception {
        String q = question.toLowerCase();

        String operation = "COUNT";
        String column = headers.get(0);
        String groupBy = null;
        String chartType = "bar";

        // Detect operation
        if (q.contains("average") || q.contains("avg") || q.contains("mean")) {
            operation = "AVG";
        } else if (q.contains("sum") || q.contains("total")) {
            operation = "SUM";
        } else if (q.contains("minimum") || q.contains("min") || q.contains("lowest")) {
            operation = "MIN";
        } else if (q.contains("maximum") || q.contains("max") || q.contains("highest")) {
            operation = "MAX";
        } else if (q.contains("count") || q.contains("how many") || q.contains("number of")) {
            operation = "COUNT";
        }

        // Detect columns mentioned in the question
        for (String header : headers) {
            if (q.contains(header.toLowerCase())) {
                column = header;
                break;
            }
        }

        // Detect group by
        if (q.contains(" by ") || q.contains("per ") || q.contains("each ") || q.contains("group")) {
            for (String header : headers) {
                String h = header.toLowerCase();
                if (q.contains(" by " + h) || q.contains("per " + h) ||
                    q.contains("each " + h) || q.contains("group by " + h)) {
                    groupBy = header;
                    break;
                }
            }
            // If no specific group column found, try to find a categorical column
            if (groupBy == null) {
                for (String header : headers) {
                    if (!header.equals(column) && q.contains(header.toLowerCase())) {
                        groupBy = header;
                        break;
                    }
                }
            }
        }

        // Detect chart type
        if (q.contains("pie") || q.contains("distribution") || q.contains("proportion")) {
            chartType = "pie";
        } else if (q.contains("line") || q.contains("trend") || q.contains("over time")) {
            chartType = "line";
        } else if (q.contains("table") || q.contains("list") || q.contains("show all")) {
            chartType = "table";
        }

        // Detect filter
        String filterColumn = null;
        String filterValue = null;
        if (q.contains("where") || q.contains("filter") || q.contains("only")) {
            for (String header : headers) {
                String h = header.toLowerCase();
                int idx = q.indexOf(h);
                if (idx >= 0 && (q.contains("where " + h) || q.contains("filter " + h) || q.contains("only " + h))) {
                    filterColumn = header;
                    // Try to extract the value after "is", "=", "equals"
                    String afterCol = q.substring(idx + h.length()).trim();
                    if (afterCol.startsWith("is ")) filterValue = afterCol.substring(3).trim();
                    else if (afterCol.startsWith("= ")) filterValue = afterCol.substring(2).trim();
                    else if (afterCol.startsWith("equals ")) filterValue = afterCol.substring(7).trim();
                    else {
                        String[] words = afterCol.split("\\s+");
                        if (words.length > 0) filterValue = words[0];
                    }
                    break;
                }
            }
        }

        QueryResponse response = dataProcessingService.processQuery(
                dataset, operation, column, groupBy, filterColumn, filterValue);

        response.setChartType(chartType);
        response.setSummary("(Rule-based analysis — no OpenAI API key configured) " + response.getSummary());

        return response;
    }

    private String getJsonText(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || value.asText().equals("null")) {
            return null;
        }
        return value.asText();
    }
}
