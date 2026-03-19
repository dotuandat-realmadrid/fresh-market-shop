package com.dotuandat.thesis.freshmarket.specifications;

import com.dotuandat.thesis.freshmarket.entities.Order;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;

public class OrderSpecification {
    public static Specification<Order> withId(String id) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(id)) return null;

            return criteriaBuilder.like(root.get("id"), "%" + id + "%");
        };
    }

    public static Specification<Order> withEmail(String email) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(email)) return null;

            return criteriaBuilder.like(root.get("user").get("username"), "%" + email + "%");
        };
    }

    public static Specification<Order> withFullName(String fullName) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(fullName)) return null;

            return criteriaBuilder.like(root.get("address").get("fullName"), "%" + fullName + "%");
        };
    }

    public static Specification<Order> withPhone(String phone) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(phone)) return null;

            return criteriaBuilder.like(root.get("address").get("phone"), "%" + phone + "%");
        };
    }

    public static Specification<Order> withDateRange(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate == null && endDate == null) return null;

            Expression<LocalDate> createdDate =
                    criteriaBuilder.function("DATE", LocalDate.class, root.get("createdDate"));

            Predicate predicate = criteriaBuilder.conjunction(); // Khởi tạo predicate mặc định (true)
            if (startDate != null) {
                predicate =
                        criteriaBuilder.and(predicate, criteriaBuilder.greaterThanOrEqualTo(createdDate, startDate));
            }
            if (endDate != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThanOrEqualTo(createdDate, endDate));
            }
            return predicate;
        };
    }
}
