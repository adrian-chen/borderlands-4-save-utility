import { describe, it, expect } from 'vitest';
import { deriveKey } from '../src/lib/crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as aesjs from 'aes-js';

describe('Debug AES', () => {
  it('should decrypt first block correctly', () => {
    const steamId = '76561198081794094';
    const key = deriveKey(steamId);
    
    // Expected key from Python
    const expectedKey = '1b8c0d70f25da0ebbe6b83115403ebfb2725642ed54906290578bd60ba4aa787';
    const actualKey = Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('Key match:', actualKey === expectedKey);
    expect(actualKey).toBe(expectedKey);
    
    // Read first block
    const savPath = join(__dirname, 'fixtures/1.sav');
    const savData = new Uint8Array(readFileSync(savPath));
    const firstBlock = savData.slice(0, 16);
    
    console.log('First block (hex):', Array.from(firstBlock).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Decrypt with aes-js
    const keyArray = Array.from(key);
    const aesCipher = new aesjs.ModeOfOperation.ecb(keyArray);
    const blockArray = Array.from(firstBlock);
    const decrypted = aesCipher.decrypt(blockArray);
    
    const decryptedHex = Array.from(decrypted).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Decrypted (hex):', decryptedHex);
    
    // Expected from Python
    const expectedHex = '789cc47d6997e246b2e8f7fb2bba8fdd';
    expect(decryptedHex).toBe(expectedHex);
  });
});
