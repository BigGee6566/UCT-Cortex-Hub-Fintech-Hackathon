import { jest } from '@jest/globals';

// AsyncStorage is a native module, so tests use the package's official in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
