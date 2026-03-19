package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findAllByIsActive(Byte isActive, Sort sort);

    @Query("SELECT c FROM Category c WHERE c.isActive = :isActive")
    Page<Category> findAllByIsActive(@Param("isActive") Byte isActive, Pageable pageable);

    Optional<Category> findByCode(String code);

    boolean existsByCode(String code);

    @Transactional(readOnly = true)
    @Query("SELECT c.code FROM Category c")
    List<String> findAllCategoryCodes();

    @Query("SELECT p.code FROM Category c JOIN c.parents p WHERE c.code = :childCode")
    List<String> findParentCodesByChildCode(@Param("childCode") String childCode);

    List<Category> findByLevelAndIsActiveOrderByCreatedDateAsc(Integer level, Byte isActive);

    @Query("""
            SELECT c FROM Category c
            WHERE c.isActive = :isActive
              AND (:level IS NULL OR c.level = :level)
              AND (:code IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :code, '%')))
              AND (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
            ORDER BY c.createdDate ASC
            """)
    Page<Category> findRootsWithFilter(
            @Param("isActive") Byte isActive,
            @Param("level") Integer level,
            @Param("code") String code,
            @Param("name") String name,
            Pageable pageable);
}
