import Debug from 'debug';

import Socket from './client';
import { actions } from './store';

const debug = Debug('hc:frontend');

export default function boot() {
  const socket = Socket({
    url: '/server-url',
    apiKey: 'org-1-api-key-1',
    customerToken: 'customer-token',
  });

  socket.addConnectionStatusListener('connected', () => {
    debug('Connected');
  });

  socket.addConnectionStatusListener('error', ({ reason }) => {
    debug('Error: ' + reason);
    actions.setError(reason);
  });

  socket.addChatStatusListener(event => {
    switch (event.status) {
      case 'assigned':
        debug(`Assigned operator: ${event.operator.name}`);
        break;

      case 'unavailable':
        debug('Chat is currently unavailable.');
        break;
    }
  });

  socket.addMessageListener(payload => {
    if (payload.sender === 'operator') {
      debug('Message received: %o', payload);
    }
    actions.addToTimeline(payload);
  });

  socket.connect();

  return {
    sendMessage: text => {
      socket.sendMessage({
        sender: 'customer',
        text,
      });
    },
  };
}
