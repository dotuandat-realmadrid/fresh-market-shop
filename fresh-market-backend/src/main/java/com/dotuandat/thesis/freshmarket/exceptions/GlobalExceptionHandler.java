//package com.dotuandat.thesis.freshmarket.exceptions;
//
//import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
//import jakarta.validation.ConstraintViolation;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.AccessDeniedException;
//import org.springframework.validation.FieldError;
//import org.springframework.web.bind.MethodArgumentNotValidException;
//import org.springframework.web.bind.annotation.ControllerAdvice;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//
//import java.util.Map;
//
//@ControllerAdvice
//public class GlobalExceptionHandler {
//    private static final String MAX_ATTRIBUTE = "max";
//    private static final String MIN_ATTRIBUTE = "min";
//
//    @ExceptionHandler(value = Exception.class)
//    public ResponseEntity<ApiResponse<?>> exceptionHandler() {
//        ApiResponse<?> apiResponse = ApiResponse.builder()
//                .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
//                .message(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
//                .build();
//
//        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getStatusCode())
//                .body(apiResponse);
//    }
//
//    @ExceptionHandler(value = AppException.class)
//    public ResponseEntity<ApiResponse<?>> customExceptionHandler(AppException e) {
//        ErrorCode errorCode = e.getErrorCode();
//
//        ApiResponse<?> apiResponse = ApiResponse.builder()
//                .code(errorCode.getCode())
//                .message(errorCode.getMessage())
//                .build();
//
//        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
//    }
//
//    @ExceptionHandler(value = AccessDeniedException.class)
//    public ResponseEntity<ApiResponse<?>> accessDeniedExceptionHandler() {
//        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
//
//        return ResponseEntity.status(errorCode.getStatusCode())
//                .body(ApiResponse.builder()
//                        .code(errorCode.getCode())
//                        .message(errorCode.getMessage())
//                        .build());
//    }
//
//    @ExceptionHandler(value = MethodArgumentNotValidException.class)
//    public ResponseEntity<ApiResponse<?>> methodArgumentNotValidExceptionHandler(MethodArgumentNotValidException e) {
//        FieldError fieldError = e.getFieldError();
//        String enumKey = fieldError != null ? fieldError.getDefaultMessage() : null;
//
//        Map<String, Object> attributes = null;
//        ErrorCode errorCode = ErrorCode.INVALID_KEY;
//
//        try {
//            errorCode = ErrorCode.valueOf(enumKey);
//
//            ConstraintViolation<?> constraintViolation =
//                    e.getBindingResult().getAllErrors().get(0).unwrap(ConstraintViolation.class);
//
//            //            ConstraintViolation<?> constraintViolation = e.getBindingResult()
//            //                    .getAllErrors().getFirst().unwrap(ConstraintViolation.class);
//
//            attributes = constraintViolation.getConstraintDescriptor().getAttributes();
//        } catch (IllegalArgumentException ignored) {
//
//        }
//
//        ApiResponse<?> apiResponse = ApiResponse.builder()
//                .code(errorCode.getCode())
//                .message(attributes != null ? mapAttribute(errorCode.getMessage(), attributes) : errorCode.getMessage())
//                .build();
//
//        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
//    }
//
//    private String mapAttribute(String message, Map<String, Object> attributes) {
//        String maxValue = String.valueOf(attributes.get(MAX_ATTRIBUTE));
//        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));
//
//        return message.replace("{" + MAX_ATTRIBUTE + "}", maxValue).replace("{" + MIN_ATTRIBUTE + "}", minValue);
//    }
//}
