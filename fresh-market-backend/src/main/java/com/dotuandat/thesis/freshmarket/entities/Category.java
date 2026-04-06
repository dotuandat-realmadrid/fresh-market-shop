package com.dotuandat.thesis.freshmarket.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "category")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Category extends BaseEntity {
    @Column(nullable = false, unique = true)
    String code;

    @Column(nullable = false)
    String name;

    private String imagePath;

    @Column(nullable = false)
    Integer level;

    // Nhiều cha -> nhiều con (ManyToMany thay vì ManyToOne)
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "category_parent",
            joinColumns = @JoinColumn(name = "child_id"),
            inverseJoinColumns = @JoinColumn(name = "parent_id"))
    List<Category> parents;

    String description;

    // Danh sách category con
    @JsonIgnore
    @ManyToMany(mappedBy = "parents")
    List<Category> children;

    @JsonIgnore
    @ManyToMany(mappedBy = "categories")
    List<Product> products;

    @ManyToMany
    @JoinTable(
            name = "category_supplier",
            joinColumns = @JoinColumn(name = "category_id"),
            inverseJoinColumns = @JoinColumn(name = "supplier_id"))
    List<Supplier> suppliers;
}
