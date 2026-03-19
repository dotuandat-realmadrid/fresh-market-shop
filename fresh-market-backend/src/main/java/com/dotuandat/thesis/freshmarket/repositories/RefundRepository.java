package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.Refund;
import com.dotuandat.thesis.freshmarket.enums.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RefundRepository extends JpaRepository<Refund, String> {

    @Query("SELECT r FROM Refund r WHERE r.isActive = :isActive")
    Page<Refund> findAllByIsActive(@Param("isActive") byte isActive, Pageable pageable);

    int countByStatus(RefundStatus pending);

    Page<Refund> findByStatusAndUser_Id(RefundStatus status, String userId, Pageable pageable);

    Page<Refund> findAllByStatus(RefundStatus status, Pageable pageable);
}
