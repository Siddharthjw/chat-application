const socket = io();

const username = new URLSearchParams(window.location.search).get('username');

if (!username) {
  // Redirect back to login page if username is not provided
  window.location.href = '/';
}

const userList = document.getElementById('user-list');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

document.addEventListener("DOMContentLoaded", function () {
  const deleteHistoryBtn = document.getElementById("delete-history-btn");
  const newChatBtn = document.getElementById("new-chat-btn");

  // Event listener for the "Delete History" button
  deleteHistoryBtn.addEventListener("click", function () {
    // Implement logic to delete chat history
    clearChat();
  });

  // Event listener for the "New Chat" button
  newChatBtn.addEventListener("click", function () {
    // Implement logic to start a new chat
    startNewChat();
  });

  function clearChat() {
    // Placeholder: Implement logic to clear chat history
    // For example, you can remove all child elements of chatMessages
    while (chatMessages.firstChild) {
      chatMessages.removeChild(chatMessages.firstChild);
    }
  }

  function startNewChat() {
    // Placeholder: Implement logic to start a new chat
    // For example, you can reload the page to create a new chat session
    location.reload();
  }
});

socket.emit('join', username);

sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('message', message);
    messageInput.value = '';
  }
});

socket.on('userList', (users) => {
  userList.textContent = 'Users online: ' + users.join(', ');
});

socket.on('message', (data) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${data.user}: ${data.message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
