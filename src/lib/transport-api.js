import uuid from 'uuid/v4';
export function createMessageId() {
  return uuid();
}
export function createTimestamp() {
  return Date.now();
}
