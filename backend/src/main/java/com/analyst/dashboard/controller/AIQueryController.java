package com.analyst.dashboard.controller;

import com.analyst.dashboard.dto.QueryRequest;
import com.analyst.dashboard.dto.QueryResponse;
import com.analyst.dashboard.model.Dataset;
import com.analyst.dashboard.model.User;
import com.analyst.dashboard.repository.DatasetRepository;
import com.analyst.dashboard.service.OpenAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
public class AIQueryController {

    private final OpenAIService openAIService;
    private final DatasetRepository datasetRepository;

    public AIQueryController(OpenAIService openAIService, DatasetRepository datasetRepository) {
        this.openAIService = openAIService;
        this.datasetRepository = datasetRepository;
    }

    @PostMapping("/query")
    public ResponseEntity<?> aiQuery(@RequestBody QueryRequest request, @AuthenticationPrincipal User user) {
        try {
            if (request.getQuestion() == null || request.getQuestion().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question is required"));
            }

            if (request.getDatasetId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dataset ID is required"));
            }

            Optional<Dataset> dataset = datasetRepository.findByIdAndUser(request.getDatasetId(), user);
            if (dataset.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            QueryResponse response = openAIService.processNaturalLanguageQuery(
                    request.getQuestion(), dataset.get());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "AI query failed: " + e.getMessage()));
        }
    }
}
