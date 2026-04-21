package com.dotuandat.thesis.freshmarket.services;

import org.springframework.web.multipart.MultipartFile;

public interface InventoryImportService {
    void importFromExcel(MultipartFile file);

    void importFromQR(MultipartFile file, String qrContent, String source);

    String importFromAI(int quantity);

    void importFromPdf(MultipartFile file);
}
