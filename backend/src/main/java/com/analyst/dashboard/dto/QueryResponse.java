package com.analyst.dashboard.dto;

import java.util.List;
import java.util.Map;

public class QueryResponse {
    private List<Map<String, Object>> data;
    private String summary;
    private String chartType; // bar, line, pie, table
    private String chartTitle;
    private List<String> labels;
    private List<Number> values;
    private String xAxis;
    private String yAxis;

    public QueryResponse() {}

    public QueryResponse(List<Map<String, Object>> data, String summary, String chartType) {
        this.data = data;
        this.summary = summary;
        this.chartType = chartType;
    }

    public List<Map<String, Object>> getData() { return data; }
    public void setData(List<Map<String, Object>> data) { this.data = data; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getChartType() { return chartType; }
    public void setChartType(String chartType) { this.chartType = chartType; }

    public String getChartTitle() { return chartTitle; }
    public void setChartTitle(String chartTitle) { this.chartTitle = chartTitle; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public List<Number> getValues() { return values; }
    public void setValues(List<Number> values) { this.values = values; }

    public String getXAxis() { return xAxis; }
    public void setXAxis(String xAxis) { this.xAxis = xAxis; }

    public String getYAxis() { return yAxis; }
    public void setYAxis(String yAxis) { this.yAxis = yAxis; }
}
