package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.entities.Contact;
import com.dotuandat.thesis.freshmarket.repositories.ContactRepository;
import com.dotuandat.thesis.freshmarket.services.ContactService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContactServiceImpl implements ContactService {
    ContactRepository contactRepository;

    @Override
    public Contact create(Contact contact) {
        return contactRepository.save(contact);
    }

    @Override
    @PreAuthorize("hasAuthority('RU_CONTACT')")
    public PageResponse<Contact> getByIsRead(boolean isRead, Pageable pageable) {
        Page<Contact> contacts = contactRepository.findAllByIsRead(isRead, pageable);

        return PageResponse.<Contact>builder()
                .pageSize(pageable.getPageSize())
                .currentPage(pageable.getPageNumber() + 1)
                .totalElements(contacts.getTotalElements())
                .totalPage(contacts.getTotalPages())
                .data(contacts.getContent())
                .build();
    }

    @Override
    @PreAuthorize("hasAuthority('RU_CONTACT')")
    public void markAsRead(String id) {
        contactRepository.findById(id).ifPresent(contact -> {
            contact.setIsRead(true);
            contactRepository.save(contact);
        });
    }

    @Override
    @PreAuthorize("hasAuthority('RU_CONTACT')")
    public int countUnreadContacts() {
        return contactRepository.countByIsRead(false);
    }
}
