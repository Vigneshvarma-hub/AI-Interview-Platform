
package com.varma.aiinterviewplatform.exception;

public class LoginRateLimitException extends RuntimeException {

    public LoginRateLimitException(String message) {
        super(message);
    }
}
