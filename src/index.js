const path = require('path');
const express = require('express');
const http = require('http'); //! after socket.io
const { Server } = require('socket.io'); //! after express
const Filter = require('bad-words');

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

  socket.emit('message', 'welcome!');

  socket.broadcast.emit('message', 'new user joined!');

  socket.on('sendMessage', (message, callback) => {
    //! bad-words
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.emit('message', message);
    callback('delivered!'); //! this message was delivered
  });

  //! send location
  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
    callback();
  });

  //! disconnect event
  socket.on('disconnect', () => {
    io.emit('message', 'user left');
  });
});

// app.listen(port, () => {
//   console.log(`Server is up on port ${port}`);
// });
//! after socket.io
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
