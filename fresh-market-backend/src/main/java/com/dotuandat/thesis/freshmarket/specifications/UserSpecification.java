package com.dotuandat.thesis.freshmarket.specifications;

import com.dotuandat.thesis.freshmarket.entities.Role;
import com.dotuandat.thesis.freshmarket.entities.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class UserSpecification {

    public static Specification<User> withId(String id) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(id)) return null;

            return criteriaBuilder.like(root.get("id"), "%" + id + "%");
        };
    }

    public static Specification<User> withUsername(String username) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(username)) return null;

            return criteriaBuilder.like(root.get("username"), "%" + username + "%");
        };
    }

    public static Specification<User> withFullName(String fullName) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasLength(fullName)) return null;

            return criteriaBuilder.like(root.get("fullName"), "%" + fullName + "%");
        };
    }

    public static Specification<User> withPhone(String phone) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(phone)) return null;

            return criteriaBuilder.like(root.get("phone"), "%" + phone + "%");
        };
    }

    public static Specification<User> withIsGuest(String isGuest) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(isGuest)) return null;

            return criteriaBuilder.equal(root.get("isGuest"), isGuest);
        };
    }

    public static Specification<User> withRole(String role) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(role)) return null;

            Join<User, Role> roleJoin = root.join("roles");
            return criteriaBuilder.equal(roleJoin.get("code"), role);
        };
    }
}
