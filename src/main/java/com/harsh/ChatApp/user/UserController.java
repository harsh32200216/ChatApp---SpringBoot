package com.harsh.ChatApp.user;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class UserController {
    
    private final UserService service;

    @MessageMapping("/user.addUser")
    @SendTo("/user/public")
    public User addUser(@Payload User user) {
        service.saveUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/public")
    public User disconnect(@Payload User user) {
        service.disconnectUser(user);
        return user;
    }

    @GetMapping("/users/{nickname}/{fullname}/{password}")
    public ResponseEntity<String> findUser(
                @PathVariable("nickname") String nickname,
                @PathVariable("fullname") String fullname,
                @PathVariable("password") String password) {
        return ResponseEntity.ok(Integer.toString(service.findUser(nickname, fullname, password)));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(service.findConnectedUsers());
    }
    
}
