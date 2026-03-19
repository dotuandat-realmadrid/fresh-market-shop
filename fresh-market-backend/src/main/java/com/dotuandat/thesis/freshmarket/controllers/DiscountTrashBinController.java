package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.DiscountTrashBinResponse;
import com.dotuandat.thesis.freshmarket.services.DiscountTrashBinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discounts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DiscountTrashBinController {

    DiscountTrashBinService discountTrashBinService;

    @GetMapping("/trash")
    public ApiResponse<List<DiscountTrashBinResponse>> findAll() {
        return ApiResponse.<List<DiscountTrashBinResponse>>builder()
                .result(discountTrashBinService.findAll())
                .build();
    }

    @PutMapping("/restore/{ids}")
    public ApiResponse<Void> delete(@PathVariable List<String> ids) {
        discountTrashBinService.restore(ids);
        return ApiResponse.<Void>builder().message("Restored successfully").build();
    }
}
