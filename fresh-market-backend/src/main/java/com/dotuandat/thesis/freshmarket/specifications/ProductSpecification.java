package com.dotuandat.thesis.freshmarket.specifications;

import com.dotuandat.thesis.freshmarket.entities.Product;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.List;

public class ProductSpecification {
    public static Specification<Product> withId(String id) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(id)) return null;

            return criteriaBuilder.like(root.get("id"), "%" + id + "%");
        };
    }

    public static Specification<Product> withCategoryCodes(List<String> categoryCodes) {
        return (root, query, criteriaBuilder) -> {
            if (categoryCodes == null || categoryCodes.isEmpty()) return null;

            // Dùng subquery thay vì JOIN để tránh duplicate
            assert query != null;
            Subquery<String> subquery = query.subquery(String.class);
            Root<Product> subRoot = subquery.correlate(root); // correlated subquery
            var categoriesJoin = subRoot.join("categories", JoinType.INNER);

            subquery.select(categoriesJoin.get("code"))
                    .where(categoriesJoin.get("code").in(categoryCodes));

            return criteriaBuilder.exists(subquery);
        };
    }

    public static Specification<Product> withSupplierCode(String supplierCode) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(supplierCode)) return null;

            return criteriaBuilder.equal(root.get("supplier").get("code"), supplierCode);
        };
    }

    public static Specification<Product> withCode(String code) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(code)) return null;

            return criteriaBuilder.like(root.get("code"), "%" + code + "%");
        };
    }

    public static Specification<Product> withName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(name)) return null;

            return criteriaBuilder.like(root.get("name"), "%" + name + "%");
        };
    }

    public static Specification<Product> withMinPrice(Long minPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null) return null;

            // Sử dụng coalesce để lấy discountPrice nếu không null, nếu không thì lấy price
            Expression<Long> effectivePrice = criteriaBuilder.coalesce(root.get("discountPrice"), root.get("price"));

            return criteriaBuilder.greaterThanOrEqualTo(effectivePrice, minPrice);
        };
    }

    public static Specification<Product> withMaxPrice(Long maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (maxPrice == null) return null;

            // Sử dụng coalesce để lấy discountPrice nếu không null, nếu không thì lấy price
            Expression<Long> effectivePrice = criteriaBuilder.coalesce(root.get("discountPrice"), root.get("price"));

            return criteriaBuilder.lessThanOrEqualTo(effectivePrice, maxPrice);
        };
    }

    public static Specification<Product> withIsActive(byte isActive) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isActive"), isActive);
    }

    public static Specification<Product> withCreatedDate() {
        return (root, query, criteriaBuilder) -> {
            if (query != null) {
                query.orderBy(criteriaBuilder.desc(criteriaBuilder.coalesce(
                        root.get("createdDate"), criteriaBuilder.literal(new java.util.Date(0)))));
            }
            return criteriaBuilder.conjunction();
        };
    }
}
