package com.abhisek.management.dto;

public class LoginResponse {

    private boolean success;
    private String message;
    private String role;

    public LoginResponse() {
    }

    public LoginResponse(boolean success,
                         String message,
                         String role) {

        this.success = success;
        this.message = message;
        this.role = role;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}