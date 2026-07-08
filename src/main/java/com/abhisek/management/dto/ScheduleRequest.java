package com.abhisek.management.dto;

import java.time.LocalDateTime;

public class ScheduleRequest {

    private Integer instanceId;

    private String frequency;

    private LocalDateTime backupDateTime;

    private String backupLocation;

    private String status;

    public ScheduleRequest() {
    }

    public Integer getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(Integer instanceId) {
        this.instanceId = instanceId;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public LocalDateTime getBackupDateTime() {
        return backupDateTime;
    }

    public void setBackupDateTime(LocalDateTime backupDateTime) {
        this.backupDateTime = backupDateTime;
    }

    public String getBackupLocation() {
        return backupLocation;
    }

    public void setBackupLocation(String backupLocation) {
        this.backupLocation = backupLocation;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}