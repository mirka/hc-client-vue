import Debug from 'debug';

import Socket from './client';

const debug = Debug('hc:frontend');

export default function boot() {
  const socket = Socket({
    url: '/server-url',
    apiKey: 'org-1-api-key-1',
    customerToken: 'customer-token',
  });

  socket.on('connected', () => {
    debug('Connected');
  });

  socket.on('error', ({ reason }) => debug('Error: ' + reason));

  socket.onChatStatus(event => {
    switch (event.status) {
      case 'assigned':
        debug(`Assigned operator: ${event.operator.name}`);

        socket.sendMessage({
          sender: 'customer',
          text: 'hi',
        });
        break;

      case 'unavailable':
        debug('Chat is currently unavailable.');
        break;
    }
  });

  socket.onMessage(payload => {
    if (payload.sender === 'operator') {
      debug('Message received: %o', payload);
    }
  });

  socket.connect();
}
