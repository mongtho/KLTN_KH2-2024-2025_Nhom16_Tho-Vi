package com.ems.ems.response;

public class SimpleMessageResponse {
    private String message;

    // Constructor
    public SimpleMessageResponse(String message) {
        this.message = message;
    }

    // Getter
    public String getMessage() {
        return message;
    }

    // Setter
    public void setMessage(String message) {
        this.message = message;
    }
} 