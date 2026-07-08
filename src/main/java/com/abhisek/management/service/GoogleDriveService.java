package com.abhisek.management.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.FileList;

@Service
public class GoogleDriveService {

	@Autowired
	@Qualifier("googleDrive")
	private Drive drive;

    public String uploadFile(File backupFile) throws IOException {

        String folderId = getOrCreateFolder("RailwayBackups");

        com.google.api.services.drive.model.File metadata =
                new com.google.api.services.drive.model.File();

        metadata.setName(backupFile.getName());

        metadata.setParents(Collections.singletonList(folderId));

        FileContent mediaContent =
                new FileContent("application/octet-stream", backupFile);

        com.google.api.services.drive.model.File uploaded =

                drive.files()

                        .create(metadata, mediaContent)

                        .setFields("id,webViewLink")

                        .execute();

        return uploaded.getWebViewLink();
    }

    private String getOrCreateFolder(String folderName)
            throws IOException {

        FileList result =
                drive.files()

                        .list()

                        .setQ("mimeType='application/vnd.google-apps.folder' and name='" + folderName + "' and trashed=false")

                        .setFields("files(id,name)")

                        .execute();

        if (!result.getFiles().isEmpty()) {

            return result.getFiles().get(0).getId();

        }

        com.google.api.services.drive.model.File folder =
                new com.google.api.services.drive.model.File();

        folder.setName(folderName);

        folder.setMimeType("application/vnd.google-apps.folder");

        folder = drive.files()

                .create(folder)

                .setFields("id")

                .execute();

        return folder.getId();
    }

}