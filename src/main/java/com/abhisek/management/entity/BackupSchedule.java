package com.abhisek.management.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "backup_schedule")
public class BackupSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Integer scheduleId;

    @ManyToOne
    @JoinColumn(name = "instance_id")
    private Instance instance;

    @Column(name = "backup_datetime")
    private LocalDateTime backupDateTime;

    @Column(name = "backup_location")
    private String backupLocation;

    private String frequency;   // DAILY, WEEKLY, MONTHLY, ONETIME

    private String status;      // ACTIVE, INACTIVE

    // Getters and Setters

    public Integer getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Integer scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Instance getInstance() {
        return instance;
    }

    public void setInstance(Instance instance) {
        this.instance = instance;
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

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}