package com.abhisek.management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.abhisek.management.dto.HistoryResponse;
import com.abhisek.management.entity.BackupHistory;
import com.abhisek.management.repository.BackupHistoryRepository;

@Service
public class HistoryService {

    private final BackupHistoryRepository backupHistoryRepository;

    public HistoryService(BackupHistoryRepository backupHistoryRepository) {
        this.backupHistoryRepository = backupHistoryRepository;
    }

    public List<HistoryResponse> getAllHistory() {
        return backupHistoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public HistoryResponse getHistoryById(Integer id) {
        BackupHistory history = backupHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Backup history not found with id: " + id));
        return mapToResponse(history);
    }

    public List<HistoryResponse> getHistoryByInstanceId(Integer instanceId) {
        return backupHistoryRepository.findAll()
                .stream()
                .filter(history -> history.getInstance() != null
                        && instanceId.equals(history.getInstance().getInstanceId()))
                .map(this::mapToResponse)
                .toList();
    }

    private HistoryResponse mapToResponse(BackupHistory history) {
        HistoryResponse response = new HistoryResponse();
        response.setBackupId(history.getBackupId());
        response.setBackupDate(history.getBackupDate());
        response.setBackupFile(history.getBackupFile());
        response.setBackupSize(history.getBackupSize());
        response.setDuration(history.getDuration());
        response.setStatus(history.getStatus());
        response.setRemarks(history.getRemarks());

        if (history.getInstance() != null) {
            response.setInstanceId(history.getInstance().getInstanceId());
            response.setInstanceName(history.getInstance().getInstanceName());
        }

        return response;
    }
}