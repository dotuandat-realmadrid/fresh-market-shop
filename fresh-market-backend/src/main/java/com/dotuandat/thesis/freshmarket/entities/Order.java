package com.dotuandat.thesis.freshmarket.entities;

import com.dotuandat.thesis.freshmarket.enums.OrderStatus;
import com.dotuandat.thesis.freshmarket.enums.OrderType;
import com.dotuandat.thesis.freshmarket.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "`order`")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    OrderStatus status;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    OrderType orderType;

    @Column(nullable = false)
    Long totalPrice;

    @Column(length = 50)
    @Enumerated(EnumType.STRING)
    PaymentMethod paymentMethod;

    String note;

    @Column(name = "payment_ref")
    String paymentRef;

    @ManyToOne
    @JoinColumn(name = "address_id")
    Address address;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    List<OrderDetail> orderDetails;
}
