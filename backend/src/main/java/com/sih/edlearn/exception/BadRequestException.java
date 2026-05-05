package com.sih.edlearn.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { 
        super(message); 
    }
}

