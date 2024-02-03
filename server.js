const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection string
const mongoUri = 'mongodb+srv://<Siddharth>:<Jagwan@123>@cluster0.hn2aoni.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB connection string

let db;

// Connect to MongoDB
MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db('chatapp'); // Replace 'chatapp' with your database name
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

app.use(express.static(path.join(__dirname, 'public')));

const activeUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    activeUsers[socket.id] = username;
    io.emit('userList', Object.values(activeUsers));
  });

  socket.on('message', (message) => {
    // Save the message to MongoDB
    const sender = activeUsers[socket.id];
    db.collection('messages').insertOne({ sender, message })
      .then(() => {
        console.log('Message saved to MongoDB');
      })
      .catch((err) => {
        console.error('Error saving message to MongoDB:', err);
      });

    io.emit('message', { user: sender, message });
  });

  // Handle user registration
  socket.on('register', (registrationData) => {
    const { username, passkey } = registrationData;
    db.collection('users').insertOne({ username, passkey })
      .then(() => {
        console.log('User registered successfully');
        socket.emit('registerResponse', { success: true, message: 'User registered successfully. You can now log in.', username });
      })
      .catch((err) => {
        console.error('Error registering user:', err);
        socket.emit('registerResponse', { success: false, message: 'Registration failed. Please try again.' });
      });
  });

  // Handle user login
  socket.on('login', (loginData) => {
    const { username, passkey } = loginData;
    db.collection('users').findOne({ username, passkey })
      .then((user) => {
        if (user) {
          console.log('User logged in successfully');
          socket.emit('loginResponse', { success: true, message: 'Login successful.', username });
        } else {
          console.log('Invalid login credentials');
          socket.emit('loginResponse', { success: false, message: 'Invalid login credentials. Please try again.' });
        }
      })
      .catch((err) => {
        console.error('Error checking login credentials:', err);
        socket.emit('loginResponse', { success: false, message: 'Login failed. Please try again.' });
      });
  });

  socket.on('disconnect', () => {
    delete activeUsers[socket.id];
    io.emit('userList', Object.values(activeUsers));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
