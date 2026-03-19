package com.dotuandat.thesis.freshmarket.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "address")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Address extends BaseEntity {
    @Column(nullable = false)
    String fullName;

    @Column(length = 10)
    String phone;

    @Column(nullable = false)
    String province;

    @Column(nullable = false)
    String district;

    @Column(nullable = false)
    String ward;

    @Column(nullable = false)
    String detail;

    @Column(name = "unique_address_key", nullable = false)
    String key;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
}
