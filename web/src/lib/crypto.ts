import { createCipheriv, createDecipheriv } from 'crypto';
import { inflateSync, deflateSync } from 'zlib';

const BASE_KEY = new Uint8Array([
  0x35, 0xEC, 0x33, 0x77, 0xF3, 0x5D, 0xB0, 0xEA,
  0xBE, 0x6B, 0x83, 0x11, 0x54, 0x03, 0xEB, 0xFB,
  0x27, 0x25, 0x64, 0x2E, 0xD5, 0x49, 0x06, 0x29,
  0x05, 0x78, 0xBD, 0x60, 0xBA, 0x4A, 0xA7, 0x87
]);

/**
 * Derives the AES key by XORing BASE_KEY with Steam ID (as little-endian 8 bytes)
 */
export function deriveKey(steamId: string): Uint8Array {
  const sid = BigInt(steamId.replace(/\D/g, ''));
  const sidBytes = new Uint8Array(8);

  // Convert to little-endian
  for (let i = 0; i < 8; i++) {
    sidBytes[i] = Number((sid >> BigInt(i * 8)) & BigInt(0xFF));
  }

  const key = new Uint8Array(BASE_KEY);
  for (let i = 0; i < 8; i++) {
    key[i] ^= sidBytes[i];
  }

  return key;
}

/**
 * PKCS7 padding
 */
function pad(data: Uint8Array, blockSize: number): Uint8Array {
  const paddingLength = blockSize - (data.length % blockSize);
  const padding = new Uint8Array(paddingLength).fill(paddingLength);
  const result = new Uint8Array(data.length + paddingLength);
  result.set(data);
  result.set(padding, data.length);
  return result;
}

/**
 * PKCS7 unpadding
 */
function unpad(data: Uint8Array): Uint8Array {
  const paddingLength = data[data.length - 1];

  // Validate padding
  for (let i = 0; i < paddingLength; i++) {
    if (data[data.length - 1 - i] !== paddingLength) {
      throw new Error('Invalid PKCS7 padding');
    }
  }

  return data.slice(0, data.length - paddingLength);
}

/**
 * AES-ECB decrypt using Node.js crypto module
 */
function aesEcbDecrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  const decipher = createDecipheriv('aes-256-ecb', key, null);
  decipher.setAutoPadding(false);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return new Uint8Array(decrypted);
}

/**
 * AES-ECB encrypt using Node.js crypto module
 */
function aesEcbEncrypt(key: Uint8Array, data: Uint8Array): Uint8Array {
  const cipher = createCipheriv('aes-256-ecb', key, null);
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return new Uint8Array(encrypted);
}

/**
 * Decrypt .sav file to YAML bytes
 */
export function decryptSavToYaml(savData: Uint8Array, steamId: string): Uint8Array {
  if (savData.length % 16 !== 0) {
    throw new Error(`Input .sav size ${savData.length} not multiple of 16`);
  }

  const key = deriveKey(steamId);
  const ptPadded = aesEcbDecrypt(key, savData);

  let body: Uint8Array;
  try {
    body = unpad(ptPadded);
  } catch {
    body = ptPadded;
  }

  const yamlData = inflateSync(body);
  return new Uint8Array(yamlData);
}

/**
 * Encrypt YAML bytes to .sav file
 */
export function encryptYamlToSav(yamlData: Uint8Array, steamId: string): Uint8Array {
  const compressed = deflateSync(yamlData, { level: 9 });

  // Calculate adler32 checksum
  const adler32 = calculateAdler32(yamlData);
  const uncompressedLength = yamlData.length;

  // Pack: compressed + adler32 (4 bytes LE) + uncompressed_length (4 bytes LE)
  const packed = new Uint8Array(compressed.length + 8);
  packed.set(compressed);

  const view = new DataView(packed.buffer);
  view.setUint32(compressed.length, adler32, true); // little-endian
  view.setUint32(compressed.length + 4, uncompressedLength, true); // little-endian

  const ptPadded = pad(packed, 16);
  const key = deriveKey(steamId);
  const encrypted = aesEcbEncrypt(key, ptPadded);

  return encrypted;
}

/**
 * Calculate Adler-32 checksum (matching zlib's adler32)
 */
function calculateAdler32(data: Uint8Array): number {
  const MOD_ADLER = 65521;
  let a = 1;
  let b = 0;

  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }

  return (b << 16) | a;
}
