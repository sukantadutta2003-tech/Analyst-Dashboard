package com.analyst.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DatasetInfo {
    private Long id;
    private String name;
    private String fileName;
    private List<String> headers;
    private int rowCount;
    private int columnCount;
    private LocalDateTime uploadedAt;

    public DatasetInfo() {}

    public DatasetInfo(Long id, String name, String fileName, List<String> headers,
                       int rowCount, int columnCount, LocalDateTime uploadedAt) {
        this.id = id;
        this.name = name;
        this.fileName = fileName;
        this.headers = headers;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public List<String> getHeaders() { return headers; }
    public void setHeaders(List<String> headers) { this.headers = headers; }

    public int getRowCount() { return rowCount; }
    public void setRowCount(int rowCount) { this.rowCount = rowCount; }

    public int getColumnCount() { return columnCount; }
    public void setColumnCount(int columnCount) { this.columnCount = columnCount; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
