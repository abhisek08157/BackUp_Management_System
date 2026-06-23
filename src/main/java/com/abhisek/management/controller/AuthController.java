package com.abhisek.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.abhisek.management.dto.LoginRequest;
import com.abhisek.management.dto.LoginResponse;
import com.abhisek.management.entity.User;
import com.abhisek.management.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        User user =
                authService.login(request);

        if(user != null) {

            return new LoginResponse(
                    true,
                    "Login Successful",
                    user.getRole());
        }

        return new LoginResponse(
                false,
                "Invalid Username or Password",
                null);
    }
}