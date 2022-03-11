const path = require('path');
const express = require('express');
const http = require('http'); //! after socket.io
const { Server } = require('socket.io'); //! after express
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app); //! after socket.io
const io = new Server(server); //! after express

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on('connection', socket => {
  console.log('New WebSocket connection');

  // socket.emit('countUpdated', count); //! event name and variable

  // socket.on('increment', () => {
  //   count++;
  //   // socket.emit('countUpdated', count);
  //   //! io.emit ile olayı mevcut olan her bir bağlantıya yayacak
  //   io.emit('countUpdated', count);
  // });

  // socket.emit('message', 'welcome!');
  //! adding  date
  // socket.emit('message', {
  //   text: 'Welcome!',
  //   createdAt: new Date().getTime()
  // });

  // socket.emit('message', generateMessage('Welcome!'));

  // socket.broadcast.emit('message', generateMessage('new user joined!'));

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // console.log({ username, room });
    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!'));

    //! sadece aynı odaya girenlere welcome ve join mesajı gönder
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    //! io.to.emit, socket.broadcast.to.emit --> belirli bir odanın üyeleriyle nasıl iletişim kuracağız
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    //! bad-words
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback(); //! this message was delivered
  });

  //! send location
  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords));
    callback();
  });

  //! disconnect event
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// app.listen(port, () => {
//   console.log(`Server is up on port ${port}`);
// });
//! after socket.io
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
