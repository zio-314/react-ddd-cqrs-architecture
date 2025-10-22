// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for jsdom
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

// Mock wagmi/actions to avoid ESM issues in Jest
jest.mock('wagmi/actions', () => ({
  readContract: jest.fn(),
  readContracts: jest.fn(),
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}), { virtual: true });

// Mock @wagmi/core/actions
jest.mock('@wagmi/core/actions', () => ({
  readContract: jest.fn(),
  readContracts: jest.fn(),
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}), { virtual: true });

// Mock @rainbow-me/rainbowkit to avoid ESM issues
jest.mock('@rainbow-me/rainbowkit', () => ({
  lightTheme: jest.fn(() => ({ colors: {} })),
  darkTheme: jest.fn(() => ({ colors: {} })),
  RainbowKitProvider: ({ children }) => children,
  ConnectButton: () => null,
}), { virtual: true });
