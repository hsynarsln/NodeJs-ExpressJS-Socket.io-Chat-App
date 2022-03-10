const socket = io();

//! callback function içerisine index.js de tanımladığımız parametreleri alıyor
// socket.on('countUpdated', count => {
//   console.log('The count has been updated', count);
// });

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked');
//   socket.emit('increment');
// });

//! Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//! Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

//! mesasge render
socket.on('message', message => {
  console.log(message);
  //! Template
  const html = Mustache.render(messageTemplate, {
    message
  });
  $messages.insertAdjacentHTML('beforeend', html); //! beforeend: sona ekleme
});

//! location message render
socket.on('locationMessage', url => {
  console.log(url);
  //! Template
  const html = Mustache.render(locationMessageTemplate, {
    url
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  //! --------disable button
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;
  //! 'sendMessafe' event name
  // socket.emit('sendMessage', message, message => {
  //   console.log('the message was delivered', message);
  // });
  //! bad-words
  socket.emit('sendMessage', message, error => {
    //!-------enable button and clear input and focus
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('the message was delivered');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  //! disable button
  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    // console.log(position);
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        //! enable button
        $sendLocationButton.removeAttribute('disabled');

        console.log('Location shared!');
      }
    );
  });
});
