package com.abhisek.management.dto;

import java.time.LocalDateTime;

public class HistoryResponse {

    private Integer backupId;
    private Integer instanceId;
    private String instanceName;
    private LocalDateTime backupDate;
    private String backupFile;
    private String backupSize;
    private String duration;
    private String status;
    private String remarks;

    public Integer getBackupId() { return backupId; }
    public void setBackupId(Integer backupId) { this.backupId = backupId; }

    public Integer getInstanceId() { return instanceId; }
    public void setInstanceId(Integer instanceId) { this.instanceId = instanceId; }

    public String getInstanceName() { return instanceName; }
    public void setInstanceName(String instanceName) { this.instanceName = instanceName; }

    public LocalDateTime getBackupDate() { return backupDate; }
    public void setBackupDate(LocalDateTime backupDate) { this.backupDate = backupDate; }

    public String getBackupFile() { return backupFile; }
    public void setBackupFile(String backupFile) { this.backupFile = backupFile; }

    public String getBackupSize() { return backupSize; }
    public void setBackupSize(String backupSize) { this.backupSize = backupSize; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    private String backupType;

	public String getBackupType() {
		return backupType;
	}
	public void setBackupType(String backupType) {
		this.backupType = backupType;
	}
}