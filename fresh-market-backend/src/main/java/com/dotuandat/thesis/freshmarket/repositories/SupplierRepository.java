package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
    List<Supplier> findAllByIsActive(Byte isActive, Sort sort);

    List<Supplier> findAllByCategories_Code(String categoriesCode, Sort sort);

    @Query("SELECT s FROM Supplier s WHERE s.isActive = :isActive")
    Page<Supplier> findAllByIsActive(@Param("isActive") Byte isActive, Pageable pageable);

    Optional<Supplier> findByCode(String code);

    boolean existsByCode(String code);

    @Transactional(readOnly = true)
    @Query("SELECT s.code FROM Supplier s")
    List<String> findAllSupplierCodes();
}
