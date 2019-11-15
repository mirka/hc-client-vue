import createMockConnection from './mock-connection';

export default function createClient(createTransport = createMockConnection) {
  return createTransport();
}
