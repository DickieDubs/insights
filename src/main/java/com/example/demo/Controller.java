
    package com.example.demo;

    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RestController;

    @RestController
    public class Controller {

        @GetMapping("/auth")
        public String authenticateUser() {
            return "User authenticated successfully!";
        }
    }
    