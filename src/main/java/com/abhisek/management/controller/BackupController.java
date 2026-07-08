package com.abhisek.management.controller;

import java.io.File;
import java.io.FileInputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.abhisek.management.dto.BackUpRequest;
import com.abhisek.management.service.BackupService;

@RestController
@RequestMapping("/api/backup")
@CrossOrigin("*")
public class BackupController {

    @Autowired
    private BackupService backupService;

    @PostMapping("/run")
    public ResponseEntity<String> runBackup(
            @RequestBody BackUpRequest request) {

        String result =
        		backupService.runBackup(

        		        request.getInstanceId(),

        		        request.getStorageType(),

        		        "MANUAL"

        		);

        return ResponseEntity.ok(result);

    }

    @GetMapping("/download/{backupId}")
    public ResponseEntity<InputStreamResource>
    downloadBackup(
            @PathVariable Integer backupId)
            throws Exception {

        File file =
                backupService.downloadBackup(
                        backupId);

        InputStreamResource resource =
                new InputStreamResource(
                        new FileInputStream(file));

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename="
                                + file.getName())
                .contentLength(file.length())
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);

    }

}