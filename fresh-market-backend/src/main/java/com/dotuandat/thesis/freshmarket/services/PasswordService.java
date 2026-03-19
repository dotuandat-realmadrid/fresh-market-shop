package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.password.ChangePasswordRequest;

public interface PasswordService {
    void changePassword(ChangePasswordRequest request);

    void setPassword(String password);

    void resetPassword(String id);

    Object forgotPassword(Object object);
}
