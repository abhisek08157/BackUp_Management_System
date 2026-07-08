package com.abhisek.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InstanceRequest {

    @NotBlank(message = "Instance Name is required")
    private String instanceName;

    @NotBlank(message = "Database Type is required")
    private String databaseType;

    @NotBlank(message = "Database Name is required")
    private String databaseName;

    @NotBlank(message = "IP Address is required")
    private String ipAddress;

    @NotNull(message = "Port is required")
    private Integer port;

    @NotBlank(message = "Username is required")
    private String dbUsername;

    @NotBlank(message = "Password is required")
    private String dbPassword;

    @NotBlank(message = "Status is required")
    private String status;

    public InstanceRequest() {
    }

    public String getInstanceName() {
        return instanceName;
    }

    public void setInstanceName(String instanceName) {
        this.instanceName = instanceName;
    }

    public String getDatabaseType() {
        return databaseType;
    }

    public void setDatabaseType(String databaseType) {
        this.databaseType = databaseType;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getDbUsername() {
        return dbUsername;
    }

    public void setDbUsername(String dbUsername) {
        this.dbUsername = dbUsername;
    }

    public String getDbPassword() {
        return dbPassword;
    }

    public void setDbPassword(String dbPassword) {
        this.dbPassword = dbPassword;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}