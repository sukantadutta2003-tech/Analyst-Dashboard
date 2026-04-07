package com.analyst.dashboard.dto;

import java.util.List;
import java.util.Map;

public class QueryRequest {
    private String question;
    private Long datasetId;

    // For manual queries
    private String operation; // SUM, AVG, COUNT, MIN, MAX, FILTER, GROUP
    private String column;
    private String groupBy;
    private String filterColumn;
    private String filterValue;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public Long getDatasetId() { return datasetId; }
    public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public String getColumn() { return column; }
    public void setColumn(String column) { this.column = column; }

    public String getGroupBy() { return groupBy; }
    public void setGroupBy(String groupBy) { this.groupBy = groupBy; }

    public String getFilterColumn() { return filterColumn; }
    public void setFilterColumn(String filterColumn) { this.filterColumn = filterColumn; }

    public String getFilterValue() { return filterValue; }
    public void setFilterValue(String filterValue) { this.filterValue = filterValue; }
}
