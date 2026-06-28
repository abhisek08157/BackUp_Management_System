package com.abhisek.management.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.abhisek.management.dto.InstanceRequest;
import com.abhisek.management.dto.InstanceResponse;
import com.abhisek.management.service.InstanceService;

@RestController
@RequestMapping("/api/instances")
@CrossOrigin("*")
public class InstanceController {

    private final InstanceService instanceService;

    public InstanceController(InstanceService instanceService) {
        this.instanceService = instanceService;
    }

    // Create Instance
    @PostMapping
    public ResponseEntity<InstanceResponse> createInstance(
            @Valid @RequestBody InstanceRequest request) {

        InstanceResponse response = instanceService.createInstance(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get All Instances
    @GetMapping
    public ResponseEntity<List<InstanceResponse>> getAllInstances() {

        List<InstanceResponse> response = instanceService.getAllInstances();

        return ResponseEntity.ok(response);
    }

    // Get Instance By ID
    @GetMapping("/{id}")
    public ResponseEntity<InstanceResponse> getInstanceById(
            @PathVariable Integer id) {

        InstanceResponse response = instanceService.getInstanceById(id);

        return ResponseEntity.ok(response);
    }

    // Update Instance
    @PutMapping("/{id}")
    public ResponseEntity<InstanceResponse> updateInstance(
            @PathVariable Integer id,
            @Valid @RequestBody InstanceRequest request) {

        InstanceResponse response = instanceService.updateInstance(id, request);

        return ResponseEntity.ok(response);
    }

    // Delete Instance
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstance(
            @PathVariable Integer id) {

        instanceService.deleteInstance(id);

        return ResponseEntity.noContent().build();
    }
}