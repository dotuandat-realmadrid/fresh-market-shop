package com.dotuandat.thesis.freshmarket.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "product")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product extends BaseEntity {
    @Column(nullable = false, unique = true)
    String code;

    @Column(nullable = false)
    String name;

    String branch;

    @Lob // Large Object
    @Column(columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    long price;

    Long discountPrice;

    @Builder.Default
    @Column(nullable = false)
    int inventoryQuantity = 0;

    @Builder.Default
    int soldQuantity = 0;

    @Builder.Default
    double point = 0;

    @Builder.Default
    double avgRating = 2.5;

    int reviewCount;

    @ManyToMany
    @JoinTable(
        name = "product_category",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    List<Category> categories;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "discount_id")
    Discount discount;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ProductImage> images;
}
