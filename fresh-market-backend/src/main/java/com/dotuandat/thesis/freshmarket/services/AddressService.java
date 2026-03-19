package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.address.AddressCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.address.AddressUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.address.AddressResponse;

import java.util.List;

public interface AddressService {

    List<AddressResponse> getAllByUserId(String userId);

    AddressResponse getAddressById(String addrressId);

    AddressResponse create(AddressCreateRequest request);

    AddressResponse update(String addressId, AddressUpdateRequest request);

    void delete(String addressId);
}
