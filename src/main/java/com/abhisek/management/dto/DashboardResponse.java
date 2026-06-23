package com.abhisek.management.dto;

public class DashboardResponse {

    private long totalInstances;
    private long totalBackups;
    private long successfulBackups;
    private long failedBackups;

    public DashboardResponse() {
    }

    public DashboardResponse(long totalInstances,
                             long totalBackups,
                             long successfulBackups,
                             long failedBackups) {

        this.totalInstances = totalInstances;
        this.totalBackups = totalBackups;
        this.successfulBackups = successfulBackups;
        this.failedBackups = failedBackups;
    }

    public long getTotalInstances() {
        return totalInstances;
    }

    public void setTotalInstances(long totalInstances) {
        this.totalInstances = totalInstances;
    }

    public long getTotalBackups() {
        return totalBackups;
    }

    public void setTotalBackups(long totalBackups) {
        this.totalBackups = totalBackups;
    }

    public long getSuccessfulBackups() {
        return successfulBackups;
    }

    public void setSuccessfulBackups(long successfulBackups) {
        this.successfulBackups = successfulBackups;
    }

    public long getFailedBackups() {
        return failedBackups;
    }

    public void setFailedBackups(long failedBackups) {
        this.failedBackups = failedBackups;
    }
}