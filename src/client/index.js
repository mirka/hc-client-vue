import Debug from 'debug';

import { Observable, Notifier } from '../lib/notifier-interface';
import { createMessageId, createTimestamp } from '../lib/transport-api';

import Socket from '../server';

const debug = Debug('hc:client');

const socketKey = Symbol('socket');
const senderKey = Symbol('sendWithMetadata');

export default class Connection {
  constructor({ url, ...config }) {
    const unacknowledgedEvents = {};

    this[socketKey] = new Socket(url || '/', config);
    this.connectionStatus = new Observable('disconnected');
    this.chatStatus = new Observable('unassigned');
    this.messageNotifier = new Notifier();
    this.typingNotifier = new Notifier();

    this[socketKey].handleEvent = (eventType, params) => {
      switch (eventType) {
        case 'connection-status':
          this.connectionStatus.update(params);
          break;
        case 'chat-status':
          this.chatStatus.update(params);
          break;
        case 'message':
          this.messageNotifier.notify(params);
          break;
        case 'operator-is-typing':
          this.typingNotifier.notify(params);
          break;
      }
    };

    this[socketKey].onAcknowledge = (id, payload) => {
      unacknowledgedEvents[id].resolve(payload);
      delete unacknowledgedEvents[id];
    };

    this[senderKey] = (eventName, payload) => {
      return new Promise(resolve => {
        const id = createMessageId();
        const data = { ...payload, timestamp: createTimestamp(), uuid: id };
        this[socketKey].emit(eventName, data);
        if (eventName === 'message') {
          unacknowledgedEvents[id] = { eventName, data, resolve };
        }
      });
    };

    debug('Initialized');
  }

  connect() {
    this.connectionStatus.update({ status: 'connecting' });
    this[socketKey].connect();
  }

  addConnectionStatusListener(listener) {
    this.connectionStatus.addListener(listener);
  }

  removeConnectionStatusListener(listener) {
    this.connectionStatus.removeListener(listener);
  }

  getConnectionStatus() {
    return this.connectionStatus.currentValue;
  }

  addMessageListener(listener) {
    this.messageNotifier.addListener(listener);
  }

  removeMessageListener(listener) {
    this.messageNotifier.removeListener(listener);
  }

  addChatStatusListener(listener) {
    this.chatStatus.addListener(listener);
  }

  removeChatStatusListener(listener) {
    this.chatStatus.removeListener(listener);
  }

  getChatStatus() {
    return this.chatStatus.currentValue;
  }

  sendMessage(text) {
    return this[senderKey]('message', {
      text,
      eventType: 'message',
      sender: 'customer',
    });
  }

  sendIsTyping() {
    this[senderKey]('customer-is-typing');
  }

  addOperatorIsTypingListener(listener) {
    this.typingNotifier.addListener(listener);
  }
}
