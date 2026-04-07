package com.analyst.dashboard.service;

import com.analyst.dashboard.dto.QueryResponse;
import com.analyst.dashboard.model.Dataset;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DataProcessingService {

    private final ObjectMapper objectMapper;

    public DataProcessingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public QueryResponse processQuery(Dataset dataset, String operation, String column,
                                       String groupBy, String filterColumn, String filterValue) throws Exception {
        List<Map<String, String>> data = objectMapper.readValue(
                dataset.getDataJson(), new TypeReference<List<Map<String, String>>>() {});

        // Apply filter if present
        if (filterColumn != null && filterValue != null && !filterColumn.isBlank()) {
            data = filterData(data, filterColumn, filterValue);
        }

        QueryResponse response = new QueryResponse();

        if (operation == null || operation.isBlank()) {
            // No operation — return raw (filtered) data
            List<Map<String, Object>> result = data.stream()
                    .map(row -> new LinkedHashMap<String, Object>(row))
                    .collect(Collectors.toList());
            response.setData(result);
            response.setChartType("table");
            response.setSummary("Showing " + result.size() + " rows of data.");
            return response;
        }

        if (groupBy != null && !groupBy.isBlank()) {
            return aggregateWithGroupBy(data, operation, column, groupBy);
        } else {
            return aggregateSimple(data, operation, column);
        }
    }

    private List<Map<String, String>> filterData(List<Map<String, String>> data,
                                                  String filterColumn, String filterValue) {
        return data.stream()
                .filter(row -> {
                    String val = row.get(filterColumn);
                    if (val == null) return false;
                    return val.toLowerCase().contains(filterValue.toLowerCase());
                })
                .collect(Collectors.toList());
    }

    private QueryResponse aggregateSimple(List<Map<String, String>> data, String operation, String column) {
        QueryResponse response = new QueryResponse();
        List<Double> numericValues = extractNumericValues(data, column);

        double result = 0;
        switch (operation.toUpperCase()) {
            case "SUM" -> result = numericValues.stream().mapToDouble(Double::doubleValue).sum();
            case "AVG", "AVERAGE" -> result = numericValues.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            case "COUNT" -> result = data.size();
            case "MIN" -> result = numericValues.stream().mapToDouble(Double::doubleValue).min().orElse(0);
            case "MAX" -> result = numericValues.stream().mapToDouble(Double::doubleValue).max().orElse(0);
        }

        Map<String, Object> resultMap = new LinkedHashMap<>();
        resultMap.put("operation", operation.toUpperCase());
        resultMap.put("column", column);
        resultMap.put("result", result);

        response.setData(List.of(resultMap));
        response.setChartType("table");
        response.setSummary(String.format("The %s of '%s' is %.2f (from %d records).",
                operation.toUpperCase(), column, result, data.size()));

        return response;
    }

    private QueryResponse aggregateWithGroupBy(List<Map<String, String>> data, String operation,
                                                String column, String groupBy) {
        QueryResponse response = new QueryResponse();

        Map<String, List<Map<String, String>>> grouped = data.stream()
                .collect(Collectors.groupingBy(
                        row -> row.getOrDefault(groupBy, "Unknown"),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<String> labels = new ArrayList<>();
        List<Number> values = new ArrayList<>();
        List<Map<String, Object>> resultData = new ArrayList<>();

        for (Map.Entry<String, List<Map<String, String>>> entry : grouped.entrySet()) {
            String groupName = entry.getKey();
            List<Map<String, String>> groupData = entry.getValue();
            List<Double> numericValues = extractNumericValues(groupData, column);

            double result = 0;
            switch (operation.toUpperCase()) {
                case "SUM" -> result = numericValues.stream().mapToDouble(Double::doubleValue).sum();
                case "AVG", "AVERAGE" -> result = numericValues.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                case "COUNT" -> result = groupData.size();
                case "MIN" -> result = numericValues.stream().mapToDouble(Double::doubleValue).min().orElse(0);
                case "MAX" -> result = numericValues.stream().mapToDouble(Double::doubleValue).max().orElse(0);
            }

            labels.add(groupName);
            values.add(Math.round(result * 100.0) / 100.0);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put(groupBy, groupName);
            row.put(operation.toUpperCase() + "_" + column, Math.round(result * 100.0) / 100.0);
            row.put("count", groupData.size());
            resultData.add(row);
        }

        response.setData(resultData);
        response.setLabels(labels);
        response.setValues(values);
        response.setXAxis(groupBy);
        response.setYAxis(operation.toUpperCase() + " of " + column);
        response.setChartType("bar");
        response.setChartTitle(operation.toUpperCase() + " of " + column + " by " + groupBy);
        response.setSummary(String.format("Grouped data by '%s': computed %s of '%s' across %d groups.",
                groupBy, operation.toUpperCase(), column, grouped.size()));

        return response;
    }

    private List<Double> extractNumericValues(List<Map<String, String>> data, String column) {
        return data.stream()
                .map(row -> row.get(column))
                .filter(val -> val != null && !val.isBlank())
                .map(val -> {
                    try {
                        return Double.parseDouble(val.replaceAll("[^0-9.\\-]", ""));
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
