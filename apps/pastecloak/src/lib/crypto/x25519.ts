import nacl from 'tweetnacl';
import { uint8ToBase64Url, base64UrlToUint8, textToBytes, bytesToText, randomBytes, concatBytes } from './utils';
import type { EncryptedData, EncryptResult } from './types';

const ALGORITHM = 'x25519-chacha20' as const;

// Generate a new X25519 keypair
export function generateKeyPair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.secretKey,
  };
}

// Encrypt content using X25519 + ChaCha20-Poly1305 (via NaCl box)
export function encrypt(content: string): EncryptResult {
  // Generate ephemeral keypair for encryption
  const senderKeyPair = generateKeyPair();
  const recipientKeyPair = generateKeyPair();
  
  // Generate nonce
  const nonce = randomBytes(nacl.box.nonceLength);
  
  // Encrypt the content
  const messageBytes = textToBytes(content);
  const ciphertext = nacl.box(
    messageBytes,
    nonce,
    recipientKeyPair.publicKey,
    senderKeyPair.privateKey
  );
  
  if (!ciphertext) {
    throw new Error('Encryption failed');
  }
  
  // Create encrypted data object
  const encrypted: EncryptedData = {
    algorithm: ALGORITHM,
    ciphertext: uint8ToBase64Url(ciphertext),
    nonce: uint8ToBase64Url(nonce),
    publicKey: uint8ToBase64Url(senderKeyPair.publicKey),
  };
  
  // Create decryption key (recipient's private key)
  const decryptionKey = uint8ToBase64Url(recipientKeyPair.privateKey);
  
  // Include recipient public key in the URL fragment for decryption
  const fullKey = `${decryptionKey}.${uint8ToBase64Url(recipientKeyPair.publicKey)}`;
  
  return { encrypted, decryptionKey: fullKey };
}

// Decrypt content using X25519 + ChaCha20-Poly1305
export function decrypt(encrypted: EncryptedData, decryptionKey: string): string {
  // Parse decryption key (privateKey.publicKey)
  const [privateKeyB64] = decryptionKey.split('.');
  
  const privateKey = base64UrlToUint8(privateKeyB64);
  const senderPublicKey = base64UrlToUint8(encrypted.publicKey!);
  const nonce = base64UrlToUint8(encrypted.nonce);
  const ciphertext = base64UrlToUint8(encrypted.ciphertext);
  
  // Decrypt
  const decrypted = nacl.box.open(ciphertext, nonce, senderPublicKey, privateKey);
  
  if (!decrypted) {
    throw new Error('Decryption failed - invalid key or corrupted data');
  }
  
  return bytesToText(decrypted);
}

