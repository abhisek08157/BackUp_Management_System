package com.abhisek.management.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.abhisek.management.dto.ScheduleRequest;
import com.abhisek.management.dto.ScheduleResponse;
import com.abhisek.management.entity.BackupSchedule;
import com.abhisek.management.entity.Instance;
import com.abhisek.management.repository.BackupScheduleRepository;
import com.abhisek.management.repository.InstanceRepository;

@Service
public class ScheduleService {

    @Autowired
    private BackupScheduleRepository repository;

    @Autowired
    private InstanceRepository instanceRepository;

    // -----------------------------
    // CREATE
    // -----------------------------

    public ScheduleResponse saveSchedule(ScheduleRequest request) {

        Instance instance = instanceRepository.findById(request.getInstanceId())
                .orElseThrow(() -> new RuntimeException("Instance not found"));

        BackupSchedule schedule = new BackupSchedule();

        schedule.setInstance(instance);
        schedule.setBackupDateTime(request.getBackupDateTime());
        schedule.setBackupLocation(request.getBackupLocation());
        schedule.setFrequency(request.getFrequency());
        schedule.setStatus(request.getStatus());

        schedule = repository.save(schedule);

        return convert(schedule);
    }

    // -----------------------------
    // GET ALL
    // -----------------------------

    public List<ScheduleResponse> getAllSchedules() {

        return repository.findAll()
                .stream()
                .map(this::convert)
                .toList();
    }

    // -----------------------------
    // GET BY ID
    // -----------------------------

    public ScheduleResponse getScheduleById(Integer id) {

        BackupSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        return convert(schedule);
    }

    // -----------------------------
    // DELETE
    // -----------------------------

    public void deleteSchedule(Integer id) {

        repository.deleteById(id);

    }

    // -----------------------------
    // ENTITY -> RESPONSE
    // -----------------------------

    private ScheduleResponse convert(BackupSchedule schedule) {

        ScheduleResponse response = new ScheduleResponse();

        response.setScheduleId(schedule.getScheduleId());

        response.setInstanceId(schedule.getInstance().getInstanceId());

        response.setInstanceName(schedule.getInstance().getInstanceName());

        response.setBackupDateTime(schedule.getBackupDateTime());

        response.setBackupLocation(schedule.getBackupLocation());

        response.setFrequency(schedule.getFrequency());

        response.setStatus(schedule.getStatus());

        return response;
    }

}