package com.dotuandat.thesis.freshmarket.services.impl;

import com.dotuandat.thesis.freshmarket.services.FileService;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileServiceImpl implements FileService {

    @NonFinal
    @Value("${app.file.storage-dir}")
    private String STORAGE_DIR;

    @Override
    public List<String> uploadFiles(MultipartFile[] files) throws IOException {
        if (files == null) {
            return new ArrayList<>();
        }

        Path folder = Paths.get(STORAGE_DIR);
        Files.createDirectories(folder);

        List<String> fileNames = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String fileExtensions = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID().toString();
            if (fileExtensions != null) {
                fileName = fileName + "." + fileExtensions;
            }

            Path filePath = folder.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            fileNames.add(fileName);
        }

        return fileNames;
    }

    @Override
    public Resource loadFileAsResource(String fileName) throws MalformedURLException {
        Path filePath = Paths.get(STORAGE_DIR).resolve(fileName);
        return new UrlResource(filePath.toUri());
    }
}
