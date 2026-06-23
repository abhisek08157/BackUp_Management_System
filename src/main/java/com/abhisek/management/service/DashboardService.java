package com.abhisek.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.abhisek.management.dto.DashboardResponse;
import com.abhisek.management.repository.BackupHistoryRepository;
import com.abhisek.management.repository.InstanceRepository;

@Service
public class DashboardService {

    @Autowired
    private InstanceRepository instanceRepository;

    @Autowired
    private BackupHistoryRepository backupHistoryRepository;

    public DashboardResponse getDashboardData() {

        long totalInstances =
                instanceRepository.count();

        long totalBackups =
                backupHistoryRepository.count();

        long successfulBackups =
                backupHistoryRepository
                        .countByStatus("SUCCESS");

        long failedBackups =
                backupHistoryRepository
                        .countByStatus("FAILED");

        return new DashboardResponse(
                totalInstances,
                totalBackups,
                successfulBackups,
                failedBackups);
    }
}