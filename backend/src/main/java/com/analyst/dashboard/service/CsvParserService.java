package com.analyst.dashboard.service;

import com.analyst.dashboard.model.Dataset;
import com.analyst.dashboard.repository.DatasetRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class CsvParserService {

    private final DatasetRepository datasetRepository;
    private final ObjectMapper objectMapper;

    public CsvParserService(DatasetRepository datasetRepository, ObjectMapper objectMapper) {
        this.datasetRepository = datasetRepository;
        this.objectMapper = objectMapper;
    }

    public Dataset parseAndSave(MultipartFile file, String datasetName) throws Exception {
        Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .setIgnoreEmptyLines(true)
                .build();

        CSVParser parser = new CSVParser(reader, format);
        List<String> headers = parser.getHeaderNames();

        List<Map<String, String>> rows = new ArrayList<>();
        for (CSVRecord record : parser) {
            Map<String, String> row = new LinkedHashMap<>();
            for (String header : headers) {
                row.put(header, record.get(header));
            }
            rows.add(row);
        }
        parser.close();

        Dataset dataset = new Dataset();
        dataset.setName(datasetName != null && !datasetName.isBlank() ? datasetName : file.getOriginalFilename());
        dataset.setFileName(file.getOriginalFilename());
        dataset.setHeadersJson(objectMapper.writeValueAsString(headers));
        dataset.setDataJson(objectMapper.writeValueAsString(rows));
        dataset.setRowCount(rows.size());
        dataset.setColumnCount(headers.size());

        return datasetRepository.save(dataset);
    }

    public List<String> getHeaders(Dataset dataset) throws JsonProcessingException {
        return objectMapper.readValue(dataset.getHeadersJson(), new TypeReference<List<String>>() {});
    }

    public List<Map<String, String>> getData(Dataset dataset) throws JsonProcessingException {
        return objectMapper.readValue(dataset.getDataJson(), new TypeReference<List<Map<String, String>>>() {});
    }
}
