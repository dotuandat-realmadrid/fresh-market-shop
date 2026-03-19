package com.dotuandat.thesis.freshmarket.repositories;

import com.dotuandat.thesis.freshmarket.entities.SupplierTrashBin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SupplierTrashBinRepository extends JpaRepository<SupplierTrashBin, String> {

    List<SupplierTrashBin> findByDeletedDateBefore(LocalDateTime time);
}
