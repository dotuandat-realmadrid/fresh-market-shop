package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.trash.DiscountTrashBinResponse;
import com.dotuandat.thesis.freshmarket.entities.Discount;
import com.dotuandat.thesis.freshmarket.entities.DiscountTrashBin;

import java.util.List;

public interface DiscountTrashBinService {

    List<DiscountTrashBinResponse> findAll();

    DiscountTrashBin create(Discount discount);

    void restore(List<String> trashBinIds);
}
