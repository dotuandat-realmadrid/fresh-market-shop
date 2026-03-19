package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.DiscountTrashBin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DiscountTrashBinRepository extends JpaRepository<DiscountTrashBin, String> {

    List<DiscountTrashBin> findByDeletedDateBefore(LocalDateTime time);

    @Query("SELECT dtb FROM DiscountTrashBin dtb WHERE dtb.discount.id = :discountId ORDER BY dtb.deletedDate DESC")
    Optional<DiscountTrashBin> findByDiscountId(@Param("discountId") String discountId);
}
