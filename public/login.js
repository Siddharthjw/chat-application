const socket = io();

document.addEventListener("DOMContentLoaded", function () {
  const createUserButton = document.getElementById("create-user-button");
  const alreadyUserButton = document.getElementById("already-user-button");
  const usernameInput = document.getElementById('username');
  const passkeyInput = document.getElementById('passkey');
  const enterButton = document.getElementById('enter-button');

  createUserButton.addEventListener("click", function () {
    const username = prompt("Enter your username:");
    const passkey = prompt("Enter your passkey:");

    if (username && passkey) {
      socket.emit('register', { username, passkey });
    }
  });

  alreadyUserButton.addEventListener("click", function () {
    // Ensure that the usernameInput exists before accessing its value
    if (usernameInput) {
      const username = usernameInput.value.trim();
      const passkey = passkeyInput.value.trim();

      if (username && passkey) {
        socket.emit('login', { username, passkey });
      }
    }
  });

  socket.on('registerResponse', (response) => {
    alert(response.message);
    if (response.success) {
      const username = encodeURIComponent(response.username);
      window.location.href = `/chat.html?username=${username}`;
    }
  });

  socket.on('loginResponse', (response) => {
    alert(response.message);
    if (response.success) {
      const username = encodeURIComponent(usernameInput.value.trim());
      window.location.href = `/chat.html?username=${username}`;
    }
  });



  function showMessage(message) {
    messageDisplay.textContent = message;
  }
});
