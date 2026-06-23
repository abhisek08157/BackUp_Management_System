package com.abhisek.management.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.abhisek.management.entity.BackupSchedule;
import com.abhisek.management.repository.BackupScheduleRepository;

@Service
public class ScheduleService {

    @Autowired
    private BackupScheduleRepository repository;

    public BackupSchedule saveSchedule(
            BackupSchedule schedule) {

        return repository.save(schedule);
    }

    public List<BackupSchedule> getAllSchedules() {

        return repository.findAll();
    }

    public BackupSchedule getScheduleById(
            Integer id) {

        return repository.findById(id)
                .orElse(null);
    }

    public void deleteSchedule(
            Integer id) {

        repository.deleteById(id);
    }
}