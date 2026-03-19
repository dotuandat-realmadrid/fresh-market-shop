package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.address.AddressCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.address.AddressUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.address.AddressResponse;
import com.dotuandat.thesis.freshmarket.services.AddressService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AddressController {
    AddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressResponse>> getAllByUserId(@RequestParam("userId") String userId) {
        return ApiResponse.<List<AddressResponse>>builder()
                .result(addressService.getAllByUserId(userId))
                .build();
    }

    @GetMapping("{addressId}")
    public ApiResponse<AddressResponse> getAddressById(@PathVariable String addressId) {
        return ApiResponse.<AddressResponse>builder()
                .result(addressService.getAddressById(addressId))
                .build();
    }

    @PostMapping
    public ApiResponse<AddressResponse> create(@RequestBody @Valid AddressCreateRequest request) {
        return ApiResponse.<AddressResponse>builder()
                .result(addressService.create(request))
                .build();
    }

    @PutMapping("/{addressId}")
    public ApiResponse<AddressResponse> update(
            @PathVariable String addressId, @RequestBody @Valid AddressUpdateRequest request) {
        return ApiResponse.<AddressResponse>builder()
                .result(addressService.update(addressId, request))
                .build();
    }

    @DeleteMapping("/{addressId}")
    public ApiResponse<Void> delete(@PathVariable String addressId) {
        addressService.delete(addressId);

        return ApiResponse.<Void>builder().message("Delete successfully").build();
    }
}
