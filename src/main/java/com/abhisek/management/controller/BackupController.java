package com.abhisek.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.io.FileInputStream;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.abhisek.management.service.BackupService;

@RestController
@RequestMapping("/api/backup")
@CrossOrigin("*")
public class BackupController {

    @Autowired
    private BackupService backupService;

    @PostMapping("/run/{instanceId}")
    public String runBackup(
            @PathVariable Integer instanceId) {

        return backupService.runBackup(instanceId);
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