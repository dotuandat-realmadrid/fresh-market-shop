package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.WishList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishListRepository extends JpaRepository<WishList, String> {
    Page<WishList> findByUserId(String userId, Pageable pageable);

    boolean existsByUser_IdAndProduct_Id(String userId, String productId);

    void deleteByUser_IdAndProduct_Id(String userId, String productId);
}
