package com.harsh.ChatApp.user;

import java.util.List;
import java.util.stream.Stream;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public void saveUser(User user) {
        user.setStatus(Status.ONLINE);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        repository.save(user);
    }

    public int findUser(String nickname, String fullname, String password) {
        var storedUser = repository.findById(nickname).orElse(null);
        if(storedUser != null){
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if(fullname.equals(storedUser.getFullname()) && passwordEncoder.matches(password,storedUser.getPassword())){
                return 1;
            }
            return 0;
        }
        return -1;
    }

    public void disconnectUser(User user) {
        var storedUser = repository.findById(user.getNickname()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(Status.OFFLINE);
            repository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return Stream.concat(
                repository.findAllByStatus(Status.ONLINE).stream(), 
                repository.findAllByStatus(Status.OFFLINE).stream()).toList();
    }

}
