package com.dotuandat.thesis.freshmarket.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "discount")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Discount extends BaseEntity {
    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "percent", nullable = false)
    Double percent;

    @Column(nullable = false)
    LocalDate startDate;

    @Column(nullable = false)
    LocalDate endDate;

    @JsonIgnore
    @OneToMany(
            mappedBy = "discount",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    List<Product> products;
}
