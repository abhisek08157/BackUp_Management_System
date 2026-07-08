package com.abhisek.management.dto;

public class BackUpRequest {

    private Integer instanceId;

    private String storageType;

    public BackUpRequest() {
    }

    public Integer getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(Integer instanceId) {
        this.instanceId = instanceId;
    }

    public String getStorageType() {
        return storageType;
    }

    public void setStorageType(String storageType) {
        this.storageType = storageType;
    }

}