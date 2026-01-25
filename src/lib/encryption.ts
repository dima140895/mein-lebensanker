/**
 * End-to-End Encryption utilities using Web Crypto API
 * 
 * This module provides zero-knowledge encryption for user data.
 * The encryption key is derived from the user's password using PBKDF2.
 * Data is encrypted/decrypted entirely client-side - the server never sees the plaintext.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return uint8ArrayToBase64(salt);
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = base64ToUint8Array(salt);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer.buffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(saltBuffer.buffer.slice(0)) as unknown as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 * Returns a base64-encoded string containing the IV + ciphertext
 */
export async function encryptData(
  data: unknown,
  password: string,
  salt: string
): Promise<string> {
  const key = await deriveKey(password, salt);
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const dataBuffer = encoder.encode(dataString);

  // Generate a random IV for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    dataBuffer
  );

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return uint8ArrayToBase64(combined);
}

/**
 * Decrypt data using AES-GCM
 * Expects a base64-encoded string containing the IV + ciphertext
 */
export async function decryptData<T = unknown>(
  encryptedData: string,
  password: string,
  salt: string
): Promise<T> {
  const key = await deriveKey(password, salt);
  const combined = base64ToUint8Array(encryptedData);

  // Extract IV and ciphertext
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  const dataString = decoder.decode(decryptedBuffer);
  return JSON.parse(dataString) as T;
}

/**
 * Verify that a password is correct by attempting to decrypt a test value
 */
export async function verifyPassword(
  encryptedTest: string,
  password: string,
  salt: string
): Promise<boolean> {
  try {
    await decryptData(encryptedTest, password, salt);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create an encrypted test value that can be used to verify the password later
 */
export async function createPasswordVerifier(
  password: string,
  salt: string
): Promise<string> {
  const testData = { verify: 'vorsorge-e2e-encryption' };
  return encryptData(testData, password, salt);
}

// Helper functions for base64 encoding/decoding
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Check if data appears to be encrypted (base64 string starting with expected length)
 */
export function isEncryptedData(data: unknown): boolean {
  if (typeof data !== 'string') return false;
  // Encrypted data is base64 and starts with the IV (12 bytes = 16 base64 chars)
  // Minimum length would be IV + some ciphertext
  try {
    const decoded = atob(data);
    return decoded.length > IV_LENGTH + 16; // At least IV + AES block
  } catch {
    return false;
  }
}
