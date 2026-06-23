package com.abhisek.management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.abhisek.management.dto.InstanceRequest;
import com.abhisek.management.dto.InstanceResponse;
import com.abhisek.management.entity.Instance;
import com.abhisek.management.repository.InstanceRepository;

@Service
public class InstanceService {

    private final InstanceRepository instanceRepository;

    public InstanceService(InstanceRepository instanceRepository) {
        this.instanceRepository = instanceRepository;
    }

    public InstanceResponse createInstance(InstanceRequest request) {
        Instance instance = mapToEntity(request);
        Instance saved = instanceRepository.save(instance);
        return mapToResponse(saved);
    }

    public List<InstanceResponse> getAllInstances() {
        return instanceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public InstanceResponse getInstanceById(Integer id) {
        Instance instance = instanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instance not found with id: " + id));
        return mapToResponse(instance);
    }

    public InstanceResponse updateInstance(Integer id, InstanceRequest request) {
        Instance instance = instanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instance not found with id: " + id));

        instance.setInstanceName(request.getInstanceName());
        instance.setDatabaseName(request.getDatabaseName());
        instance.setIpAddress(request.getIpAddress());
        instance.setPort(request.getPort());
        instance.setDbUsername(request.getDbUsername());
        instance.setDbPassword(request.getDbPassword());
        instance.setStatus(request.getStatus());

        Instance updated = instanceRepository.save(instance);
        return mapToResponse(updated);
    }

    public void deleteInstance(Integer id) {
        if (!instanceRepository.existsById(id)) {
            throw new RuntimeException("Instance not found with id: " + id);
        }
        instanceRepository.deleteById(id);
    }

    private Instance mapToEntity(InstanceRequest request) {
        Instance instance = new Instance();
        instance.setInstanceName(request.getInstanceName());
        instance.setDatabaseName(request.getDatabaseName());
        instance.setIpAddress(request.getIpAddress());
        instance.setPort(request.getPort());
        instance.setDbUsername(request.getDbUsername());
        instance.setDbPassword(request.getDbPassword());
        instance.setStatus(request.getStatus());
        return instance;
    }

    private InstanceResponse mapToResponse(Instance instance) {
        InstanceResponse response = new InstanceResponse();
        response.setInstanceId(instance.getInstanceId());
        response.setInstanceName(instance.getInstanceName());
        response.setDatabaseName(instance.getDatabaseName());
        response.setIpAddress(instance.getIpAddress());
        response.setPort(instance.getPort());
        response.setDbUsername(instance.getDbUsername());
        response.setStatus(instance.getStatus());
        return response;
    }
}