const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatapp',
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected');
});

// Create a table for storing users



app.use(express.static(path.join(__dirname, 'public')));

const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    activeUsers[socket.id] = username;
    io.emit('userList', Object.values(activeUsers));
  });

  socket.on('message', (message) => {
    // Save the message to the database
    const sender = activeUsers[socket.id];
    db.query('INSERT INTO messages (sender, message) VALUES (?, ?)', [sender, message], (err, result) => {
      if (err) {
        console.error('Error saving message to the database:', err);
      } else {
        console.log('Message saved to the database');
      }
    });

    io.emit('message', { user: sender, message });
  });

  // Handle user registration
  socket.on('register', (registrationData) => {
    const { username, passkey } = registrationData;
    db.query('INSERT INTO users (username, passkey) VALUES (?, ?)', [username, passkey], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        socket.emit('registerResponse', { success: false, message: 'Registration failed. Please try again.' });
      } else {
        console.log('User registered successfully', result);
        socket.emit('registerResponse', { success: true, message: 'User registered successfully. You can now log in.', username });
      }
    });
  });
  


  // Handle user login
  // Handle user login
socket.on('login', (loginData) => {
  const { username, passkey } = loginData;
  db.query('SELECT * FROM users WHERE username = ? AND passkey = ?', [username, passkey], (err, results) => {
    if (err) {
      console.error('Error checking login credentials:', err);
      socket.emit('loginResponse', { success: false, message: 'Login failed. Please try again.' });
    } else {
      if (results.length > 0) {
        console.log('User logged in successfully');
        socket.emit('loginResponse', { success: true, message: 'Login successful.', username });
      } else {
        console.log('Invalid login credentials');
        socket.emit('loginResponse', { success: false, message: 'Invalid login credentials. Please try again.' });
      }
    }
  });
});


  socket.on('disconnect', () => {
    delete activeUsers[socket.id];
    io.emit('userList', Object.values(activeUsers));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '';
server.listen(PORT, HOST, () => {
  console.log(`Server is running on ==>  http://${HOST}:${PORT}`);
});
