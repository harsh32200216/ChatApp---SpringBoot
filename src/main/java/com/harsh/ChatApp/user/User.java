package com.harsh.ChatApp.user;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document
public class User {

    @Id
    private String nickname;
    private String fullname;
    private String password;
    private Status status;
    
}
