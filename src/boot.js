import Debug from 'debug';

import Connection from './client';
import createConnection from './lib/happychat';
import { actions } from './store';

const debug = Debug('hc:frontend');

export default function boot() {
  const connection = createConnection(
    () =>
      new Connection({
        url: '/server-url',
        apiKey: 'org-1-api-key-1',
        customerToken: 'customer-token',
      })
  );

  connection.addConnectionStatusListener(event => {
    actions.addToTimeline({ text: event.status, sender: 'connection' });
    debug(status);
  });

  connection.addChatStatusListener(event => {
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

  connection.addMessageListener(event => {
    if (event.sender === 'operator') {
      debug('Message received: %o', event);
    }
    actions.addToTimeline(event);
  });

  connection.addOperatorIsTypingListener(() => {
    debug('Operator is typing...');
    actions.setOperatorIsTyping();
  });

  connection.connect();

  return {
    emitCustomerTyping: () => {
      connection.sendIsTyping();
    },
    sendMessage: text => {
      connection.sendMessage(text).then(receipt => {
        debug('Successfully sent message: ' + receipt.text);
      });
    },
  };
}
