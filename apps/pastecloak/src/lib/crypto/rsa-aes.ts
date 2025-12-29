import { uint8ToBase64Url, base64UrlToUint8, textToBytes, bytesToText, randomBytes } from './utils';
import type { EncryptedData, EncryptResult } from './types';

const ALGORITHM = 'rsa-aes' as const;

// Generate RSA-OAEP keypair using Web Crypto API
async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate AES-256-GCM key
async function generateAESKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to raw bytes
async function exportKey(key: CryptoKey, format: 'raw' | 'pkcs8' | 'spki'): Promise<Uint8Array> {
  const exported = await crypto.subtle.exportKey(format, key);
  return new Uint8Array(exported);
}

// Import RSA public key
async function importRSAPublicKey(keyData: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'spki',
    keyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

// Import RSA private key
async function importRSAPrivateKey(keyData: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
}

// Import AES key
async function importAESKey(keyData: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

// Encrypt content using RSA-OAEP + AES-256-GCM (hybrid encryption)
export async function encrypt(content: string): Promise<EncryptResult> {
  // Generate RSA keypair
  const rsaKeyPair = await generateRSAKeyPair();
  
  // Generate AES key for content encryption
  const aesKey = await generateAESKey();
  const aesKeyRaw = await exportKey(aesKey, 'raw');
  
  // Generate nonce for AES-GCM
  const nonce = randomBytes(12);
  
  // Encrypt content with AES-GCM
  const messageBytes = textToBytes(content);
  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    messageBytes
  );
  
  // Encrypt AES key with RSA public key
  const encryptedAESKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    rsaKeyPair.publicKey,
    aesKeyRaw
  );
  
  // Export RSA public key
  const rsaPublicKey = await exportKey(rsaKeyPair.publicKey, 'spki');
  
  // Export RSA private key for decryption
  const rsaPrivateKey = await exportKey(rsaKeyPair.privateKey, 'pkcs8');
  
  // Combine encrypted AES key + encrypted content
  const encryptedAESKeyBytes = new Uint8Array(encryptedAESKey);
  const encryptedContentBytes = new Uint8Array(encryptedContent);
  
  // Create encrypted data object
  const encrypted: EncryptedData = {
    algorithm: ALGORITHM,
    ciphertext: uint8ToBase64Url(encryptedContentBytes),
    nonce: uint8ToBase64Url(nonce),
    publicKey: uint8ToBase64Url(rsaPublicKey),
    encapsulation: uint8ToBase64Url(encryptedAESKeyBytes), // Encrypted AES key
  };
  
  // Decryption key is the RSA private key
  const decryptionKey = uint8ToBase64Url(rsaPrivateKey);
  
  return { encrypted, decryptionKey };
}

// Decrypt content using RSA-OAEP + AES-256-GCM
export async function decrypt(encrypted: EncryptedData, decryptionKey: string): Promise<string> {
  // Import RSA private key
  const rsaPrivateKeyBytes = base64UrlToUint8(decryptionKey);
  const rsaPrivateKey = await importRSAPrivateKey(rsaPrivateKeyBytes);
  
  // Decrypt AES key
  const encryptedAESKey = base64UrlToUint8(encrypted.encapsulation!);
  const aesKeyRaw = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    rsaPrivateKey,
    encryptedAESKey
  );
  
  // Import AES key
  const aesKey = await importAESKey(new Uint8Array(aesKeyRaw));
  
  // Decrypt content
  const nonce = base64UrlToUint8(encrypted.nonce);
  const ciphertext = base64UrlToUint8(encrypted.ciphertext);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    ciphertext
  );
  
  return bytesToText(new Uint8Array(decrypted));
}

