import { Observable, Notifier } from './notifier-interface';
import { createMessageId, createTimestamp } from './transport-api';

export class MockConnection {
  constructor() {
    this.connectionStatus = new Observable('disconnected');
    this.chatStatus = new Observable('unassigned');
    this.messageNotifier = new Notifier();
  }

  connect() {
    this.connectionStatus.update('connecting');
    setTimeout(() => this.connectionStatus.update('connected'), 1000);
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

  sendMessage(message) {
    // nooped for now
    const messageId = createMessageId();
    const sentTimestamp = createTimestamp();
    return {
      messageId,
      sentTimestamp,
      receipt: new Promise(resolve => {
        setTimeout(() => {
          const inboundMessage = {
            id: messageId,
            timestamp: createTimestamp(),
            text: message.text,
            author: 'customer',
          };
          resolve({ message: inboundMessage });
          this.messageNotifier.notify(inboundMessage);
        }, 100);
      }),
    };
  }
}

export default function createMockConnection() {
  const connection = new MockConnection();
  return connection;
}
