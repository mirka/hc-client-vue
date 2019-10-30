import Debug from 'debug';

import Socket from '../server';

const debug = Debug('hc:client');

export default function({ url, ...config }) {
  const socket = new Socket(url || '/', config);
  const events = {};

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

  const sendWithTimestamp = (eventName, payload) => {
    socket.emit(eventName, { ...payload, timestamp: Date.now() });
  };

  debug('Initialized');

  return {
    connect: () => socket.connect(),
    addConnectionStatusListener: addListener,
    removeConnectionStatusListener: removeListener,
    addMessageListener: callback => addListener('message', callback),
    sendMessage: payload => sendWithTimestamp('message', payload),
    removeMessageListener: callback => removeListener('message', callback),
    addChatStatusListener: callback => addListener('chat-status', callback),
    removeChatStatusListener: callback =>
      removeListener('chat-status', callback),
    sendChatStatus: event => sendWithTimestamp('chat-status', event),
    addCustomEventListener: (eventName, callback) =>
      addListener('custom-' + eventName, callback),
    removeCustomEventListener: (eventName, callback) =>
      removeListener('custom-' + eventName, callback),
    sendCustomEvent: (eventName, callback) =>
      addListener('custom-' + eventName, callback),
  };
}
