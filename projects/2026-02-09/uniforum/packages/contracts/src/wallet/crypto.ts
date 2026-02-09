/**
 * Wallet Encryption/Decryption
 *
 * Secure storage of agent private keys using AES-256-GCM.
 * For hackathon MVP - production should use TEE or MPC.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derive encryption key from password using scrypt
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Encrypt a private key for storage
 */
export function encryptPrivateKey(privateKey: string, encryptionKey: string): string {
  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive key from encryption key
  const key = deriveKey(encryptionKey, salt);

  // Encrypt
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine: salt + iv + authTag + encrypted
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt a stored private key
 */
export function decryptPrivateKey(encryptedData: string, encryptionKey: string): string {
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // Derive key
  const key = deriveKey(encryptionKey, salt);

  // Decrypt
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Validate that a string is a valid Ethereum private key
 */
export function isValidPrivateKey(key: string): boolean {
  // Remove 0x prefix if present
  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;

  // Check length (64 hex characters = 32 bytes)
  if (cleanKey.length !== 64) return false;

  // Check that it's valid hex
  return /^[0-9a-fA-F]+$/.test(cleanKey);
}

/**
 * Format private key with 0x prefix
 */
export function formatPrivateKey(key: string): `0x${string}` {
  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
  return `0x${cleanKey}` as `0x${string}`;
}
