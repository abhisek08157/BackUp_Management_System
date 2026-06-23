package com.abhisek.management.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "backup_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackupHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "backup_id")
    private Integer backupId;

    @ManyToOne
    @JoinColumn(name = "instance_id")
    private Instance instance;

    @Column(name = "backup_date")
    private LocalDateTime backupDate;

    @Column(name = "backup_file")
    private String backupFile;

    @Column(name = "backup_size")
    private String backupSize;

    private String duration;

    private String status;

    private String remarks;

	public Integer getBackupId() {
		return backupId;
	}

	public void setBackupId(Integer backupId) {
		this.backupId = backupId;
	}

	public Instance getInstance() {
		return instance;
	}

	public void setInstance(Instance instance) {
		this.instance = instance;
	}

	public LocalDateTime getBackupDate() {
		return backupDate;
	}

	public void setBackupDate(LocalDateTime backupDate) {
		this.backupDate = backupDate;
	}

	public String getBackupFile() {
		return backupFile;
	}

	public void setBackupFile(String backupFile) {
		this.backupFile = backupFile;
	}

	public String getBackupSize() {
		return backupSize;
	}

	public void setBackupSize(String backupSize) {
		this.backupSize = backupSize;
	}

	public String getDuration() {
		return duration;
	}

	public void setDuration(String duration) {
		this.duration = duration;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
}