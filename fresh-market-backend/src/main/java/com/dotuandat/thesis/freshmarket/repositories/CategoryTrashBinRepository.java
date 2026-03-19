package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.CategoryTrashBin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CategoryTrashBinRepository extends JpaRepository<CategoryTrashBin, String> {

    List<CategoryTrashBin> findByDeletedDateBefore(LocalDateTime time);
}
