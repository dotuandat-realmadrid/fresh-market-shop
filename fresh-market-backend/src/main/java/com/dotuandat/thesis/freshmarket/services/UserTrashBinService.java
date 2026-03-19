package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.UserTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.entities.UserTrashBin;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserTrashBinService {

    PageResponse<UserTrashBinResponse> search(Pageable pageable);

    List<UserTrashBin> create(List<User> users);

    void restore(List<String> ids);
}
