package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.user.GuestCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.user.UserCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.user.UserSearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.user.UserUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.user.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    PageResponse<UserResponse> search(UserSearchRequest request, Pageable pageable);

    UserResponse create(UserCreateRequest request);

    UserResponse createGuest(GuestCreateRequest request);

    UserResponse update(String id, UserUpdateRequest request);

    void delete(List<String> ids);

    UserResponse getMyInfo();

    UserResponse getById(String id);
}
