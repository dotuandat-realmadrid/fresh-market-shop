package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.product.DiscountProductRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.entities.Discount;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DiscountService {
    Discount getById(String id);

    List<Discount> getAll();

    PageResponse<Discount> search(Pageable pageable);

    Discount create(Discount discount);

    Discount update(String id, Discount request);

    Discount addDiscountProducts(String id, DiscountProductRequest request);

    void delete(String id);

    void remove(String id);
}
