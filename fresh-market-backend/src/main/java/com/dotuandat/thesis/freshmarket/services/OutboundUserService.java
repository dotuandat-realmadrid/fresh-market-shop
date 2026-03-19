package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.user.OutboundUserResponse;
import com.dotuandat.thesis.freshmarket.entities.User;

public interface OutboundUserService {
    User onboardUser(OutboundUserResponse userInfo);
}
