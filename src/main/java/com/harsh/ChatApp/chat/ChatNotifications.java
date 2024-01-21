package com.harsh.ChatApp.chat;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatNotifications {

    private String id;
    private String senderId;
    private String recipientId;
    private String content;
    private Date timestamp;
    
}
