package com.dotuandat.thesis.freshmarket.services;

import com.dotuandat.thesis.freshmarket.dtos.response.PageResponse;
import com.dotuandat.thesis.freshmarket.entities.Contact;
import org.springframework.data.domain.Pageable;

public interface ContactService {
    Contact create(Contact contact);

    PageResponse<Contact> getByIsRead(boolean isRead, Pageable pageable);

    void markAsRead(String id);

    int countUnreadContacts();
}
