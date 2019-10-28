import Debug from 'debug';

import Socket from '../server';

const debug = Debug('hc:client');

export default function({ url, ...config }) {
  const socket = new Socket(url || '/', config);
  const events = {};

  const on = (eventName, callback) => {
    const existingCallbacks = events[eventName] || [];
    events[eventName] = [...existingCallbacks, callback];
  };
  const off = (eventName, callback) => {
    events[eventName] = events[eventName].filter(
      existingCallback => existingCallback !== callback
    );
  };

  socket.handleEvent = (eventName, params) => {
    if (events[eventName]) {
      events[eventName].forEach(callback => callback(params));
    }
  };

  debug('Initialized');

  return {
    connect: () => socket.connect(),
    on,
    off,
    onMessage: callback => on('message', callback),
    sendMessage: payload => socket.emit('message', payload),
    offMessage: callback => off('message', callback),
    onChatStatus: callback => on('chat-status', callback),
    offChatStatus: callback => off('chat-status', callback),
    sendChatStatus: event => socket.emit('chat-status', event),
    onCustomEvent: (eventName, callback) => on('custom-' + eventName, callback),
    offCustomEvent: (eventName, callback) =>
      off('custom-' + eventName, callback),
    sendCustomEvent: (eventName, callback) =>
      on('custom-' + eventName, callback),
  };
}
