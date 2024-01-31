'use strict';

const usernamePage = document.querySelector('#username-page');
const registrationPage = document.querySelector('#registration-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const registrationForm = document.querySelector('#registrationForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');
const login = document.querySelector('#login');
const reg = document.querySelector('#register');

let stompClient = null;
let nickname = null;
let fullname = null;
let password = null;
let selectedUserId = null;

async function connect(event){
    event.preventDefault();

    nickname = document.querySelector('#nickname').value.trim();
    fullname = document.querySelector('#fullname').value.trim();
    password = document.querySelector('#password').value.trim();

    const fetchResult = await fetch(`/users/${nickname}/${fullname}/${password}`);
    const res = await fetchResult.json();
    if (nickname && fullname && password) {
        if (res == 1) {
            usernamePage.classList.add('hidden');
            chatPage.classList.remove('hidden');

            const socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, onConnected, onError);
        }
        else {
            alert("Invalid credentials.")
        }
    }
    else{
        alert("Error")
    }
}

async function register(event) {
    event.preventDefault();

    nickname = document.querySelector('#nickname1').value.trim();
    fullname = document.querySelector('#fullname1').value.trim();
    password = document.querySelector('#password1').value.trim();

    const fetchResult = await fetch(`/users/${nickname}/${fullname}/${password}`);
    const res = await fetchResult.json();
    if (nickname && fullname && password) {
        if (res == -1) {
            registrationPage.classList.add('hidden');
            chatPage.classList.remove('hidden');

            const socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, onConnected, onError);
        }
        else if(fetchResult == 0){
            alert("Nickname already in use.")
        }
        else {
            alert("User already exists. Please login instead.")
        }
    }
    else{
        alert("Error")
    }
}

function loginPageDisplay() {
    registrationPage.classList.add('hidden');
    usernamePage.classList.remove('hidden');
}

function registerPageDisplay() {
    usernamePage.classList.add('hidden');
    registrationPage.classList.remove('hidden');
}

function onConnected() {
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);

    stompClient.send("/app/user.addUser",
        {},
        JSON.stringify({nickname: nickname, fullname: fullname, password: password, status: 'ONLINE'})
    );

    document.querySelector('#connected-user-fullname').textContent = fullname;
    findAndDisplayConnectedUsers().then();
}

async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch('/users');
    let connectedUsers = await connectedUsersResponse.json();
    connectedUsers = connectedUsers.filter(user => user.nickname !== nickname);
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUsersList);
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickname;

    const userImage = document.createElement('img');
    if(user.status == 'ONLINE'){
        userImage.src = '../img/user_icon.png';
    }
    else{
        userImage.src = '../img/user_icon_offline.png';
    }
    userImage.alt = user.fullname;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullname;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);
    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
}

function displayMessage(senderId, content, time) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === nickname) {
        messageContainer.classList.add('sender');
    }
    else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    message.textContent = content;
    const tim = document.createElement('p');
    tim.classList.add('mini');
    tim.textContent = time.substring(11,16) + ", " + time.substring(0,10);
    messageContainer.appendChild(message);
    messageContainer.appendChild(tim);
    chatArea.appendChild(messageContainer);
}

async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content, chat.timestamp);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}

function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    const date = new Date().toISOString();
    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: nickname,
            recipientId: selectedUserId,
            content: messageInput.value.trim(),
            timestamp: date
        };
        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        displayMessage(nickname, messageInput.value.trim(), date);
        messageInput.value = '';
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}

async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    const message = JSON.parse(payload.body);
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content, message.timestamp);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    }
    else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

function onLogout() {
    stompClient.send("/app/user.disconnectUser",
        {},
        JSON.stringify({nickname: nickname, fullname: fullname, password: password, status: 'OFFLINE'})
    );
    window.location.reload();
}

usernameForm.addEventListener('submit', connect, true);
registrationForm.addEventListener('submit', register, true);
messageForm.addEventListener('submit', sendMessage, true);
reg.addEventListener('click', registerPageDisplay, true);
login.addEventListener('click', loginPageDisplay, true);
logout.addEventListener('click', onLogout, true);
window.onbeforeunload = () => onLogout();