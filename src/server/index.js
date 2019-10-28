import { get } from 'lodash';
import Debug from 'debug';

const debug = Debug('hc:server');

const orgs = {
  1: {
    isUnavailable: false,
    operators: { 1: { name: 'Operator 1' } }
  }
};
const apiKeys = {
  'org-1-api-key-1': { organizationId: 1 }
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
    this.events = {
      message: [
        payload => {
          if (this.chatStatus !== 'assigned') {
            this.emit('error', {
              reason: `'${
                payload.sender
              }' attempted to send message, but chat is not active.`
            });
            return;
          }

          debug('Message received: %o', payload);
        }
      ],
      'chat-status': [event => (this.chatStatus = event.status)]
    };
  }

  connect() {
    const apiKey = get(this.params, 'apiKey');
    const organizationId = authenticate(apiKey);

    if (!organizationId) {
      delay(() => {
        debug('Failed to connect.');
        this.emit('error', { reason: 'API Key is invalid.' });
      });
      return;
    }

    delay(() => {
      debug(
        `Connected to '${
          this.url
        }', organization id ${organizationId} with params %O`,
        this.params
      );
      this.emit('connected');

      this.assign(organizationId);
    });
  }

  on(eventName, callback) {
    const existingCallbacks = this.events[eventName] || [];
    this.events[eventName] = [...existingCallbacks, callback];
  }

  off(eventName, callback) {
    this.events[eventName] = this.events[eventName].filter(
      existingCallback => existingCallback !== callback
    );
  }

  assign(organizationId) {
    if (orgs[organizationId].isUnavailable) {
      this.emit('chat-status', { status: 'unavailable' });
      return;
    }

    this.emit('chat-status', { status: 'assigning' });
    const operator = findBestOperator(organizationId);
    this.emit('chat-status', { status: 'assigned', operator });
  }

  emit(eventName, params) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(params));
    }

    if (this.handleEvent) {
      this.handleEvent(eventName, params);
    }
  }
}
