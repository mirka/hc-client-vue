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

  socket.addConnectionStatusListener(event => {
    let text;

    switch (event.status) {
      case 'connected':
        text = 'Connected';
        break;
      case 'error':
        text = 'Error: ' + event.reason;
        actions.setError(event.reason);
    }

    actions.addToTimeline({ ...event, text, sender: 'connection' });
    debug(text);
  });

  socket.addChatStatusListener(event => {
    let text;

    switch (event.status) {
      case 'assigning':
        text = 'Assigning operator...';
        break;
      case 'assigned':
        text = `Assigned operator: ${event.operator.name}`;
        break;
      case 'unavailable':
        text = 'Chat is currently unavailable.';
        break;
    }

    actions.addToTimeline({ ...event, text, sender: 'chat' });
    debug(text);
  });

  socket.addMessageListener(event => {
    if (event.sender === 'operator') {
      debug('Message received: %o', event);
    }
    actions.addToTimeline(event);
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
