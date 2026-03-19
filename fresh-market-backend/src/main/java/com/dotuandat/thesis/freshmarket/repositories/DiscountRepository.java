package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DiscountRepository extends JpaRepository<Discount, String> {

    List<Discount> findAllByIsActive(Byte isActive, Sort sort);

    @Query("SELECT d FROM Discount d WHERE d.isActive = :isActive")
    Page<Discount> findAllByIsActive(@Param("isActive") Byte isActive, Pageable pageable);

}
