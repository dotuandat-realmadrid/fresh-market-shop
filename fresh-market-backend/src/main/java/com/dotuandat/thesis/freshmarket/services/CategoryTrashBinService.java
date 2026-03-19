package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.CategoryTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Category;
import com.dotuandat.thesis.freshmarket.entities.CategoryTrashBin;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryTrashBinService {

    PageResponse<CategoryTrashBinResponse> search(Pageable pageable);

    CategoryTrashBin create(Category categories);

    void restore(List<String> categoryIds);
}
