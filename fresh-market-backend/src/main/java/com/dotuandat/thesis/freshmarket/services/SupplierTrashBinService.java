package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.dtos.response.trash.SupplierTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Supplier;
import com.dotuandat.thesis.freshmarket.entities.SupplierTrashBin;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SupplierTrashBinService {

    PageResponse<SupplierTrashBinResponse> search(Pageable pageable);

    SupplierTrashBin create(Supplier supplier);

    void restore(List<String> supplierIds);
}
