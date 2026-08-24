export type EncryptionAlgorithm = 
  | 'x25519-chacha20'      // X25519 + ChaCha20-Poly1305 (Modern, fast)
  | 'rsa-aes'              // RSA-OAEP + AES-256-GCM (Classic, Web Crypto native)
  | 'kyber-chacha20'       // Kyber-768 + ChaCha20-Poly1305 (Post-quantum)
  | 'hybrid-pq';           // Kyber + X25519 Hybrid (Maximum security)

export interface EncryptedData {
  algorithm: EncryptionAlgorithm;
  ciphertext: string;      // Base64 encoded
  nonce: string;           // Base64 encoded
  publicKey?: string;      // Base64 encoded (for asymmetric)
  encapsulation?: string;  // Base64 encoded (for Kyber)
}

export interface DecryptionKey {
  algorithm: EncryptionAlgorithm;
  privateKey: string;      // Base64 encoded
  kyberPrivateKey?: string; // Base64 encoded (for hybrid)
}

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface EncryptResult {
  encrypted: EncryptedData;
  decryptionKey: string;   // Base64 encoded key to put in URL fragment
}

export const ALGORITHM_INFO: Record<EncryptionAlgorithm, {
  name: string;
  description: string;
  security: 'high' | 'very-high' | 'quantum-safe';
  speed: 'fast' | 'very-fast' | 'moderate';
}> = {
  'x25519-chacha20': {
    name: 'X25519 + ChaCha20',
    description: 'Modern elliptic curve encryption used by Signal & WireGuard',
    security: 'very-high',
    speed: 'very-fast',
  },
  'rsa-aes': {
    name: 'RSA + AES-256',
    description: 'Classic encryption with Web Crypto API native support',
    security: 'high',
    speed: 'moderate',
  },
  'kyber-chacha20': {
    name: 'Kyber-768 + ChaCha20',
    description: 'Post-quantum lattice-based encryption (NIST standard)',
    security: 'quantum-safe',
    speed: 'fast',
  },
  'hybrid-pq': {
    name: 'Kyber + X25519 Hybrid',
    description: 'Maximum security combining post-quantum and classical crypto',
    security: 'quantum-safe',
    speed: 'fast',
  },
};

