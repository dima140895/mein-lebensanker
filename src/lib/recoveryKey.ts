/**
 * Recovery Key utilities for E2E Encryption
 * 
 * The recovery key allows users to recover their encryption password
 * if they forget it. The password is encrypted with the recovery key
 * and stored in the database.
 */

const RECOVERY_KEY_LENGTH = 32;
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

/**
 * Generate a random recovery key
 * Returns a base64-encoded string that users should save securely
 */
export function generateRecoveryKey(): string {
  const keyBytes = crypto.getRandomValues(new Uint8Array(RECOVERY_KEY_LENGTH));
  return uint8ArrayToBase64(keyBytes);
}

/**
 * Format recovery key for display (in groups of 4 characters)
 */
export function formatRecoveryKey(key: string): string {
  return key.match(/.{1,4}/g)?.join('-') || key;
}

/**
 * Parse a formatted recovery key back to its original form
 */
export function parseRecoveryKey(formattedKey: string): string {
  return formattedKey.replace(/-/g, '');
}

/**
 * Derive an encryption key from the recovery key
 */
async function deriveKeyFromRecoveryKey(recoveryKey: string): Promise<CryptoKey> {
  const keyBytes = base64ToUint8Array(recoveryKey);
  // Create a new ArrayBuffer to avoid SharedArrayBuffer issues
  const keyBuffer = new ArrayBuffer(keyBytes.length);
  new Uint8Array(keyBuffer).set(keyBytes);
  
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt the user's password with the recovery key
 * This encrypted password is stored in the database
 */
export async function encryptPasswordWithRecoveryKey(
  password: string,
  recoveryKey: string
): Promise<string> {
  const key = await deriveKeyFromRecoveryKey(recoveryKey);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    passwordBuffer
  );
  
  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);
  
  return uint8ArrayToBase64(combined);
}

/**
 * Decrypt the user's password using the recovery key
 */
export async function decryptPasswordWithRecoveryKey(
  encryptedPassword: string,
  recoveryKey: string
): Promise<string> {
  const key = await deriveKeyFromRecoveryKey(recoveryKey);
  const combined = base64ToUint8Array(encryptedPassword);
  
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Helper functions
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
