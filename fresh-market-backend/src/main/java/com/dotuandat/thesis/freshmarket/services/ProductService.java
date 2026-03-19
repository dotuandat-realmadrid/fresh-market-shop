package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductCreateRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductSearchRequest;
import com.dotuandat.thesis.freshmarket.dtos.request.product.ProductUpdateRequest;
import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.product.ProductResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    PageResponse<ProductResponse> search(ProductSearchRequest request, Pageable pageable);

    ProductResponse getByCode(String code);

    ProductResponse create(ProductCreateRequest request);

    ProductResponse update(String id, ProductUpdateRequest request);

    void saveProductImages(String id, List<String> fileNames);

    void updateProductImages(String id, List<String> keepImages, List<String> newFileNames);

    void delete(List<String> ids);

    ProductResponse updateImport(String code, ProductUpdateRequest request);

    List<ProductResponse> getAllProducts();
}
