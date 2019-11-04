import { get } from 'lodash';
import Debug from 'debug';
import uuid from 'uuid/v4';

const debug = Debug('hc:server');

const orgs = {
  1: {
    isUnavailable: false,
    operators: { 1: { name: 'Operator 1' } },
  },
};
const apiKeys = {
  'org-1-api-key-1': { organizationId: 1 },
};

function authenticate(key) {
  const organizationId = get(apiKeys[key], 'organizationId');

  if (!organizationId) {
    debug(`Unknown API Key: '${key}'`);
    return null;
  }

  debug(
    `Authenticated API Key: '${key}' for organization id ${organizationId}`
  );
  return organizationId;
}

function findBestOperator(organizationId) {
  // First operator gets every chat :)
  return orgs[organizationId].operators['1'];
}

function delay(func) {
  return window.setTimeout(func, 800);
}

export default class Socket {
  constructor(url, params) {
    this.url = url;
    this.params = params;
    this._events = {
      message: [
        payload => {
          if (this._chatStatus !== 'assigned') {
            this.emit('connection-status', {
              eventType: 'connection-status',
              reason: `'${payload.sender}' attempted to send message, but chat is not active.`,
              status: 'error',
            });
            return;
          }

          if (payload.sender === 'customer') {
            debug('Message received: %o', payload);
            window.setTimeout(() => {
              this._simulateMessage(`${payload.text}?`);
            }, 500);
          }
        },
      ],
      'chat-status': [
        event => {
          if (event.status === 'operator-is-typing') {
            return;
          }
          if (event.status === 'customer-is-typing') {
            debug('Customer is typing...');
            return;
          }
          this._chatStatus = event.status;
        },
      ],
    };
  }

  connect() {
    const apiKey = get(this.params, 'apiKey');
    const organizationId = authenticate(apiKey);

    if (!organizationId) {
      delay(() => {
        debug('Failed to connect.');
        this.emit('connection-status', {
          eventType: 'connection-status',
          reason: 'API Key is invalid.',
          status: 'error',
        });
      });
      return;
    }

    delay(() => {
      debug(
        `Connected to '${this.url}', organization id ${organizationId} with params %O`,
        this.params
      );
      this.emit('connection-status', {
        eventType: 'connection-status',
        status: 'connected',
      });

      this._assign(organizationId);
    });
  }

  _assign(organizationId) {
    if (orgs[organizationId].isUnavailable) {
      this.emit('chat-status', {
        eventType: 'chat-status',
        status: 'unavailable',
      });
      return;
    }

    this.emit('chat-status', { eventType: 'chat-status', status: 'assigning' });
    const operator = findBestOperator(organizationId);
    this.emit('chat-status', {
      eventType: 'chat-status',
      status: 'assigned',
      operator,
    });
    this._simulateMessage('Hi there!');
  }

  _simulateMessage(text) {
    this.emit('chat-status', {
      eventType: 'chat-status',
      status: 'operator-is-typing',
    });
    window.setTimeout(() => {
      this.emit('message', {
        eventType: 'message',
        sender: 'operator',
        text,
      });
    }, 1500);
  }

  emit(eventName, payload) {
    // Add timestamp and uuid if they don't exist yet
    const completePayload = {
      timestamp: Date.now(),
      uuid: uuid(),
      ...payload,
    };

    if (this.handleEvent) {
      this.handleEvent(eventName, completePayload);
    }

    if (this._events[eventName]) {
      this._events[eventName].forEach(callback => callback(completePayload));
    }
  }
}
