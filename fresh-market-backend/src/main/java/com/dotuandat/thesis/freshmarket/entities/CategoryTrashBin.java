package com.dotuandat.thesis.freshmarket.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "category_trash")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTrashBin {
    @Id
    @Column(columnDefinition = "VARCHAR(36)")
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "category_id", referencedColumnName = "id", unique = true, columnDefinition = "VARCHAR(36)")
    private Category category;

    @Column(name = "deleted_date", nullable = false)
    private LocalDateTime deletedDate = LocalDateTime.now();
}
