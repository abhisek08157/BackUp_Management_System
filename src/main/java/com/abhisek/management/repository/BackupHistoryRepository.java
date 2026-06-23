package com.abhisek.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.abhisek.management.entity.BackupHistory;

public interface BackupHistoryRepository
        extends JpaRepository<BackupHistory, Integer> {

    long countByStatus(String status);

}