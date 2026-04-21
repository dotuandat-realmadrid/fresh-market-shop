package com.dotuandat.thesis.freshmarket.services;

import org.springframework.web.multipart.MultipartFile;

public interface ProductImportService {
    void importCreateFromExcel(MultipartFile file);

    void importUpdateFromExcel(MultipartFile file);

    void importCreateFromQR(MultipartFile file, String qrContent, String source);

    void importUpdateFromQR(MultipartFile file, String qrContent, String source);

    String importCreateByAI(int quantity);

    void importCreateFromPdf(MultipartFile file);

    void importUpdateFromPdf(MultipartFile file);
}
