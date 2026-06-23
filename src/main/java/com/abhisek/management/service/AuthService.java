package com.abhisek.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.abhisek.management.dto.LoginRequest;
import com.abhisek.management.entity.User;
import com.abhisek.management.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User login(LoginRequest request) {

        User user =
                userRepository.findByUsername(
                        request.getUsername());

        if(user == null) {
            return null;
        }

        if(user.getPassword()
               .equals(request.getPassword())) {

            return user;
        }

        return null;
    }
}