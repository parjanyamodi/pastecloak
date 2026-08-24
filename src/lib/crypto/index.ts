import type { EncryptionAlgorithm, EncryptedData, EncryptResult } from './types';
import * as x25519 from './x25519';
import * as rsaAes from './rsa-aes';
import * as kyber from './kyber';
import * as hybrid from './hybrid';

export type { EncryptionAlgorithm, EncryptedData, EncryptResult };
export { ALGORITHM_INFO } from './types';

/**
 * Encrypt content using the specified algorithm
 * Returns encrypted data (to store on server) and decryption key (for URL fragment)
 */
export async function encrypt(
  content: string,
  algorithm: EncryptionAlgorithm = 'x25519-chacha20'
): Promise<EncryptResult> {
  switch (algorithm) {
    case 'x25519-chacha20':
      return x25519.encrypt(content);
    case 'rsa-aes':
      return rsaAes.encrypt(content);
    case 'kyber-chacha20':
      return kyber.encrypt(content);
    case 'hybrid-pq':
      return hybrid.encrypt(content);
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}

/**
 * Decrypt content using the key from URL fragment
 */
export async function decrypt(
  encrypted: EncryptedData,
  decryptionKey: string
): Promise<string> {
  switch (encrypted.algorithm) {
    case 'x25519-chacha20':
      return x25519.decrypt(encrypted, decryptionKey);
    case 'rsa-aes':
      return rsaAes.decrypt(encrypted, decryptionKey);
    case 'kyber-chacha20':
      return kyber.decrypt(encrypted, decryptionKey);
    case 'hybrid-pq':
      return hybrid.decrypt(encrypted, decryptionKey);
    default:
      throw new Error(`Unknown algorithm: ${encrypted.algorithm}`);
  }
}

/**
 * Parse encrypted data from JSON string
 */
export function parseEncryptedData(json: string): EncryptedData {
  return JSON.parse(json) as EncryptedData;
}

/**
 * Serialize encrypted data to JSON string
 */
export function serializeEncryptedData(data: EncryptedData): string {
  return JSON.stringify(data);
}

