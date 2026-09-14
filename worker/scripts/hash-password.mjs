#!/usr/bin/env node
/**
 * Generate a PBKDF2 password hash in the exact format the Worker stores.
 * Usage: node scripts/hash-password.mjs [password]
 */
import { webcrypto as crypto } from 'node:crypto';

const password = process.argv[2] || 'Admin123!';
const iterations = 100000;

const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);

const b64 = (buf) => Buffer.from(buf).toString('base64');
console.log(`pbkdf2$${iterations}$${b64(salt)}$${b64(new Uint8Array(bits))}`);
