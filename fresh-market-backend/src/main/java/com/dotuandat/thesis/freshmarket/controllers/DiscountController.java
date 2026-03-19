package com.dotuandat.thesis.freshmarket.controllers;

import com.dotuandat.thesis.freshmarket.dtos.request.product.DiscountProductRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.ApiResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.entities.Discount;
import com.dotuandat.thesis.freshmarket.services.DiscountService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discounts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DiscountController {
    DiscountService discountService;

    @GetMapping("/{id}")
    public ApiResponse<Discount> getById(@PathVariable String id) {
        return ApiResponse.<Discount>builder()
                .result(discountService.getById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<Discount>> getAll() {
        return ApiResponse.<List<Discount>>builder()
                .result(discountService.getAll())
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<Discount>> search(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate").and(Sort.by(Sort.Direction.ASC, "id"));

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        return ApiResponse.<PageResponse<Discount>>builder()
                .result(discountService.search(pageable))
                .build();
    }

    @PostMapping
    public ApiResponse<Discount> create(@RequestBody Discount request) {
        return ApiResponse.<Discount>builder()
                .result(discountService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<Discount> update(@PathVariable String id, @RequestBody Discount request) {
        return ApiResponse.<Discount>builder()
                .result(discountService.update(id, request))
                .build();
    }

    @PostMapping("/{id}/products")
    public ApiResponse<Discount> addDiscountProducts(
            @PathVariable String id, @RequestBody DiscountProductRequest request) {
        return ApiResponse.<Discount>builder()
                .result(discountService.addDiscountProducts(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        discountService.delete(id);

        return ApiResponse.<Void>builder().message("Delete successfully").build();
    }
}
