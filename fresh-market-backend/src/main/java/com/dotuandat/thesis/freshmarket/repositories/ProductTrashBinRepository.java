package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.ProductTrashBin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductTrashBinRepository extends JpaRepository<ProductTrashBin, String> {

    List<ProductTrashBin> findByDeletedDateBefore(LocalDateTime time);

    @Query("SELECT ptb FROM ProductTrashBin ptb WHERE ptb.product.id = :productId ORDER BY ptb.deletedDate DESC")
    Optional<ProductTrashBin> findByProductId(@Param("productId") String productId);
}
