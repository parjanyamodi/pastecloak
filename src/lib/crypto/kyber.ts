import { Kyber768 } from 'crystals-kyber-js';
import nacl from 'tweetnacl';
import { uint8ToBase64Url, base64UrlToUint8, textToBytes, bytesToText, randomBytes, concatBytes } from './utils';
import type { EncryptedData, EncryptResult } from './types';

const ALGORITHM = 'kyber-chacha20' as const;

// Encrypt content using Kyber-768 for key encapsulation + ChaCha20-Poly1305 for data
export async function encrypt(content: string): Promise<EncryptResult> {
  // Initialize Kyber-768
  const kyber = new Kyber768();
  
  // Generate Kyber keypair
  const [kyberPublicKey, kyberPrivateKey] = await kyber.generateKeyPair();
  
  // Encapsulate - generates shared secret and ciphertext
  const [ciphertextKyber, sharedSecret] = await kyber.encap(kyberPublicKey);
  
  // Use shared secret as key for symmetric encryption
  // ChaCha20-Poly1305 via NaCl secretbox (uses XSalsa20-Poly1305, similar security)
  const nonce = randomBytes(nacl.secretbox.nonceLength);
  const messageBytes = textToBytes(content);
  
  // Use first 32 bytes of shared secret as key
  const symmetricKey = sharedSecret.slice(0, 32);
  
  const ciphertext = nacl.secretbox(messageBytes, nonce, symmetricKey);
  
  if (!ciphertext) {
    throw new Error('Encryption failed');
  }
  
  // Create encrypted data object
  const encrypted: EncryptedData = {
    algorithm: ALGORITHM,
    ciphertext: uint8ToBase64Url(ciphertext),
    nonce: uint8ToBase64Url(nonce),
    publicKey: uint8ToBase64Url(kyberPublicKey),
    encapsulation: uint8ToBase64Url(ciphertextKyber),
  };
  
  // Decryption key is the Kyber private key
  const decryptionKey = uint8ToBase64Url(kyberPrivateKey);
  
  return { encrypted, decryptionKey };
}

// Decrypt content using Kyber-768 + ChaCha20-Poly1305
export async function decrypt(encrypted: EncryptedData, decryptionKey: string): Promise<string> {
  // Initialize Kyber-768
  const kyber = new Kyber768();
  
  // Parse keys
  const kyberPrivateKey = base64UrlToUint8(decryptionKey);
  const ciphertextKyber = base64UrlToUint8(encrypted.encapsulation!);
  
  // Decapsulate to get shared secret
  const sharedSecret = await kyber.decap(ciphertextKyber, kyberPrivateKey);
  
  // Use first 32 bytes as symmetric key
  const symmetricKey = sharedSecret.slice(0, 32);
  
  // Decrypt content
  const nonce = base64UrlToUint8(encrypted.nonce);
  const ciphertext = base64UrlToUint8(encrypted.ciphertext);
  
  const decrypted = nacl.secretbox.open(ciphertext, nonce, symmetricKey);
  
  if (!decrypted) {
    throw new Error('Decryption failed - invalid key or corrupted data');
  }
  
  return bytesToText(decrypted);
}

