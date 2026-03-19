package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.ProductTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Product;
import com.dotuandat.thesis.freshmarket.entities.ProductTrashBin;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductTrashBinService {

    PageResponse<ProductTrashBinResponse> search(Pageable pageable);

    List<ProductTrashBin> create(List<Product> products);

    void restore(List<String> productIds);
}
