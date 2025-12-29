import { Kyber768 } from 'crystals-kyber-js';
import nacl from 'tweetnacl';
import { uint8ToBase64Url, base64UrlToUint8, textToBytes, bytesToText, randomBytes, concatBytes } from './utils';
import type { EncryptedData, EncryptResult } from './types';

const ALGORITHM = 'hybrid-pq' as const;

// HKDF-like key derivation (simplified)
async function deriveKey(kyberSecret: Uint8Array, x25519Secret: Uint8Array): Promise<Uint8Array> {
  // Combine both secrets
  const combined = concatBytes(kyberSecret, x25519Secret);
  
  // Hash to derive final key
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return new Uint8Array(hashBuffer);
}

// Encrypt using Kyber-768 + X25519 hybrid (maximum security)
export async function encrypt(content: string): Promise<EncryptResult> {
  // === Kyber part ===
  const kyber = new Kyber768();
  const [kyberPublicKey, kyberPrivateKey] = await kyber.generateKeyPair();
  const [ciphertextKyber, kyberSharedSecret] = await kyber.encap(kyberPublicKey);
  
  // === X25519 part ===
  const senderKeyPair = nacl.box.keyPair();
  const recipientKeyPair = nacl.box.keyPair();
  
  // Compute X25519 shared secret
  const x25519SharedSecret = nacl.box.before(recipientKeyPair.publicKey, senderKeyPair.secretKey);
  
  // === Derive combined key ===
  const combinedKey = await deriveKey(kyberSharedSecret, x25519SharedSecret);
  
  // === Encrypt content ===
  const nonce = randomBytes(nacl.secretbox.nonceLength);
  const messageBytes = textToBytes(content);
  const ciphertext = nacl.secretbox(messageBytes, nonce, combinedKey);
  
  if (!ciphertext) {
    throw new Error('Encryption failed');
  }
  
  // === Pack public data ===
  // Combine Kyber public key + X25519 sender public key
  const publicData = concatBytes(
    new Uint8Array([kyberPublicKey.length >> 8, kyberPublicKey.length & 0xff]), // 2 bytes length prefix
    kyberPublicKey,
    senderKeyPair.publicKey
  );
  
  // Create encrypted data object
  const encrypted: EncryptedData = {
    algorithm: ALGORITHM,
    ciphertext: uint8ToBase64Url(ciphertext),
    nonce: uint8ToBase64Url(nonce),
    publicKey: uint8ToBase64Url(publicData),
    encapsulation: uint8ToBase64Url(ciphertextKyber),
  };
  
  // === Pack private key for decryption ===
  // Combine Kyber private key + X25519 recipient private key
  const privateData = concatBytes(
    new Uint8Array([kyberPrivateKey.length >> 8, kyberPrivateKey.length & 0xff]),
    kyberPrivateKey,
    recipientKeyPair.secretKey
  );
  
  const decryptionKey = uint8ToBase64Url(privateData);
  
  return { encrypted, decryptionKey };
}

// Decrypt using Kyber-768 + X25519 hybrid
export async function decrypt(encrypted: EncryptedData, decryptionKey: string): Promise<string> {
  // === Parse private key ===
  const privateData = base64UrlToUint8(decryptionKey);
  const kyberPrivateKeyLength = (privateData[0] << 8) | privateData[1];
  const kyberPrivateKey = privateData.slice(2, 2 + kyberPrivateKeyLength);
  const x25519PrivateKey = privateData.slice(2 + kyberPrivateKeyLength);
  
  // === Parse public key ===
  const publicData = base64UrlToUint8(encrypted.publicKey!);
  const kyberPublicKeyLength = (publicData[0] << 8) | publicData[1];
  const x25519SenderPublicKey = publicData.slice(2 + kyberPublicKeyLength);
  
  // === Kyber decapsulation ===
  const kyber = new Kyber768();
  const ciphertextKyber = base64UrlToUint8(encrypted.encapsulation!);
  const kyberSharedSecret = await kyber.decap(ciphertextKyber, kyberPrivateKey);
  
  // === X25519 shared secret ===
  const x25519SharedSecret = nacl.box.before(x25519SenderPublicKey, x25519PrivateKey);
  
  // === Derive combined key ===
  const combinedKey = await deriveKey(kyberSharedSecret, x25519SharedSecret);
  
  // === Decrypt content ===
  const nonce = base64UrlToUint8(encrypted.nonce);
  const ciphertext = base64UrlToUint8(encrypted.ciphertext);
  
  const decrypted = nacl.secretbox.open(ciphertext, nonce, combinedKey);
  
  if (!decrypted) {
    throw new Error('Decryption failed - invalid key or corrupted data');
  }
  
  return bytesToText(decrypted);
}

