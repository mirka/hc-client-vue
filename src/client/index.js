import Debug from 'debug';
import uuid from 'uuid/v4';

import Socket from '../server';

const debug = Debug('hc:client');

export default function({ url, ...config }) {
  const socket = new Socket(url || '/', config);
  const events = {};
  const unacknowledgedEvents = {};

  const addListener = (eventName, callback) => {
    const existingCallbacks = events[eventName] || [];
    events[eventName] = [...existingCallbacks, callback];
  };
  const removeListener = (eventName, callback) => {
    events[eventName] = events[eventName].filter(
      existingCallback => existingCallback !== callback
    );
  };

  socket.handleEvent = (eventName, params) => {
    if (events[eventName]) {
      events[eventName].forEach(callback => callback(params));
    }
  };

  socket.onAcknowledge = (id, payload) => {
    unacknowledgedEvents[id].resolve(payload);
    delete unacknowledgedEvents[id];
  };

  const sendWithMetadata = (eventName, payload) => {
    return new Promise(resolve => {
      const id = uuid();
      const data = { ...payload, timestamp: Date.now(), uuid: id };
      socket.emit(eventName, data);
      if (eventName === 'message') {
        unacknowledgedEvents[id] = { eventName, data, resolve };
      }
    });
  };

  debug('Initialized');

  return {
    connect: () => socket.connect(),
    addConnectionStatusListener: callback =>
      addListener('connection-status', callback),
    removeConnectionStatusListener: callback =>
      removeListener('connection-status', callback),
    addMessageListener: callback => addListener('message', callback),
    sendMessage: payload =>
      sendWithMetadata('message', { ...payload, eventType: 'message' }),
    removeMessageListener: callback => removeListener('message', callback),
    addChatStatusListener: callback => addListener('chat-status', callback),
    removeChatStatusListener: callback =>
      removeListener('chat-status', callback),
    sendChatStatus: event =>
      sendWithMetadata('chat-status', { ...event, eventType: 'chat-status' }),
    addCustomEventListener: (eventName, callback) =>
      addListener('custom-' + eventName, callback),
    removeCustomEventListener: (eventName, callback) =>
      removeListener('custom-' + eventName, callback),
    sendCustomEvent: eventName => sendWithMetadata('custom-' + eventName),
    sendIsTyping: () => sendWithMetadata('customer-is-typing'),
    addOperatorIsTypingListener: callback =>
      addListener('operator-is-typing', callback),
  };
}
