package com.dotuandat.thesis.freshmarket.converters;

import com.dotuandat.thesis.freshmarket.constants.StatusConstant;
import com.dotuandat.thesis.freshmarket.dtos.request.address.AddressCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.address.AddressUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.address.AddressResponse;
import com.dotuandat.thesis.freshmarket.entities.Address;
import com.dotuandat.thesis.freshmarket.entities.User;
import com.dotuandat.thesis.freshmarket.exceptions.AppException;
import com.dotuandat.thesis.freshmarket.exceptions.ErrorCode;
import com.dotuandat.thesis.freshmarket.repositories.UserRepository;
import com.dotuandat.thesis.freshmarket.utils.AddressUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AddressConverter {
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserRepository userRepository;

    // create
    public Address toEntity(AddressCreateRequest request) {
        User user = userRepository
                .findByIdAndIsActive(request.getUserId(), StatusConstant.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Address address = modelMapper.map(request, Address.class);
        address.setUser(user);
        address.setKey(AddressUtils.generateUniqueAddressKey(address));

        address.setCreatedDate(LocalDateTime.now());
        address.setModifiedDate(LocalDateTime.now());

        return address;
    }

    // update
    public Address toEntity(Address address, AddressUpdateRequest request) {
        modelMapper.map(request, address);
        address.setKey(AddressUtils.generateUniqueAddressKey(address));
        return address;
    }

    public AddressResponse toResponse(Address address) {
        AddressResponse response = modelMapper.map(address, AddressResponse.class);
        response.setUserId(address.getUser().getId());
        return response;
    }
}
