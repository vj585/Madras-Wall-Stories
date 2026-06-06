import { proxy } from '../src/proxy.js';
import { NextRequest } from 'next/server.js';

// Mocking getToken and NextResponse
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn(url => ({ status: 302, url })),
    json: jest.fn((body, init) => ({ status: init.status, body })),
    next: jest.fn(() => ({ status: 200, next: true })),
  },
}));

// Actually, jest is too much overhead. I'll just write a vanilla node script that requires it, but wait, proxy.js uses ES modules and imports from "next/server".
