package com.analyst.dashboard.controller;

import com.analyst.dashboard.dto.DatasetInfo;
import com.analyst.dashboard.dto.QueryRequest;
import com.analyst.dashboard.dto.QueryResponse;
import com.analyst.dashboard.model.Dataset;
import com.analyst.dashboard.repository.DatasetRepository;
import com.analyst.dashboard.service.CsvParserService;
import com.analyst.dashboard.service.DataProcessingService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    private final CsvParserService csvParserService;
    private final DatasetRepository datasetRepository;
    private final DataProcessingService dataProcessingService;
    private final ObjectMapper objectMapper;

    public DatasetController(CsvParserService csvParserService,
                              DatasetRepository datasetRepository,
                              DataProcessingService dataProcessingService,
                              ObjectMapper objectMapper) {
        this.csvParserService = csvParserService;
        this.datasetRepository = datasetRepository;
        this.dataProcessingService = dataProcessingService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCsv(@RequestParam("file") MultipartFile file,
                                        @RequestParam(value = "name", required = false) String name) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String originalName = file.getOriginalFilename();
            if (originalName == null || !originalName.toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only CSV files are allowed"));
            }

            Dataset dataset = csvParserService.parseAndSave(file, name);
            return ResponseEntity.ok(toDatasetInfo(dataset));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to process CSV: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DatasetInfo>> getAllDatasets() {
        List<Dataset> datasets = datasetRepository.findAllByOrderByUploadedAtDesc();
        List<DatasetInfo> infos = datasets.stream()
                .map(this::toDatasetInfo)
                .collect(Collectors.toList());
        return ResponseEntity.ok(infos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDataset(@PathVariable Long id) {
        Optional<Dataset> dataset = datasetRepository.findById(id);
        if (dataset.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Dataset d = dataset.get();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", d.getId());
            result.put("name", d.getName());
            result.put("fileName", d.getFileName());
            result.put("headers", objectMapper.readValue(d.getHeadersJson(), new TypeReference<List<String>>() {}));
            result.put("data", objectMapper.readValue(d.getDataJson(), new TypeReference<List<Map<String, String>>>() {}));
            result.put("rowCount", d.getRowCount());
            result.put("columnCount", d.getColumnCount());
            result.put("uploadedAt", d.getUploadedAt());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve dataset: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDataset(@PathVariable Long id) {
        if (!datasetRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        datasetRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Dataset deleted successfully"));
    }

    @PostMapping("/{id}/query")
    public ResponseEntity<?> queryDataset(@PathVariable Long id, @RequestBody QueryRequest request) {
        try {
            Optional<Dataset> dataset = datasetRepository.findById(id);
            if (dataset.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            QueryResponse response = dataProcessingService.processQuery(
                    dataset.get(),
                    request.getOperation(),
                    request.getColumn(),
                    request.getGroupBy(),
                    request.getFilterColumn(),
                    request.getFilterValue()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Query failed: " + e.getMessage()));
        }
    }

    private DatasetInfo toDatasetInfo(Dataset d) {
        try {
            List<String> headers = objectMapper.readValue(d.getHeadersJson(), new TypeReference<List<String>>() {});
            return new DatasetInfo(d.getId(), d.getName(), d.getFileName(), headers,
                    d.getRowCount(), d.getColumnCount(), d.getUploadedAt());
        } catch (Exception e) {
            return new DatasetInfo(d.getId(), d.getName(), d.getFileName(), List.of(),
                    d.getRowCount(), d.getColumnCount(), d.getUploadedAt());
        }
    }
}
