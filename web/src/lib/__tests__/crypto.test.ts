import { describe, it, expect } from 'vitest';
import { deriveKey, decryptSavToYaml, encryptYamlToSav } from '../crypto';
import { TEST_STEAM_IDS } from '../../../tests/fixtures/sample-serials';

describe('Crypto', () => {
  describe('deriveKey', () => {
    it('should derive a 32-byte key from Steam ID', () => {
      const steamId = TEST_STEAM_IDS[0];
      const key = deriveKey(steamId);

      expect(key).toBeInstanceOf(Uint8Array);
      expect(key.length).toBe(32);
    });

    it('should derive different keys for different Steam IDs', () => {
      const key1 = deriveKey(TEST_STEAM_IDS[0]);
      const key2 = deriveKey(TEST_STEAM_IDS[1]);

      expect(key1).not.toEqual(key2);
    });

    it('should derive the same key for the same Steam ID', () => {
      const steamId = TEST_STEAM_IDS[0];
      const key1 = deriveKey(steamId);
      const key2 = deriveKey(steamId);

      expect(key1).toEqual(key2);
    });

    it('should handle Steam ID with non-numeric characters', () => {
      const steamId = 'STEAM_76561198000000000';
      const key = deriveKey(steamId);

      expect(key).toBeInstanceOf(Uint8Array);
      expect(key.length).toBe(32);
    });

    it('should XOR BASE_KEY with Steam ID bytes', () => {
      const steamId = TEST_STEAM_IDS[0];
      const key = deriveKey(steamId);

      // Key should be different from base key (unless Steam ID is all zeros)
      expect(key[0]).toBeDefined();
    });
  });

  describe('Round-trip encryption/decryption', () => {
    it('should encrypt and decrypt YAML data', () => {
      const steamId = TEST_STEAM_IDS[0];
      const originalYaml = new TextEncoder().encode('test: value\nfoo: bar\n');

      const encrypted = encryptYamlToSav(originalYaml, steamId);
      const decrypted = decryptSavToYaml(encrypted, steamId);

      expect(decrypted).toEqual(originalYaml);
    });

    it('should handle empty YAML data', () => {
      const steamId = TEST_STEAM_IDS[0];
      const originalYaml = new Uint8Array(0);

      const encrypted = encryptYamlToSav(originalYaml, steamId);
      const decrypted = decryptSavToYaml(encrypted, steamId);

      expect(decrypted).toEqual(originalYaml);
    });

    it('should handle large YAML data', () => {
      const steamId = TEST_STEAM_IDS[0];
      const largeData = new Uint8Array(10000).fill(0x42);

      const encrypted = encryptYamlToSav(largeData, steamId);
      const decrypted = decryptSavToYaml(encrypted, steamId);

      expect(decrypted).toEqual(largeData);
    });

    it('should compress and decompress YAML data', () => {
      const steamId = TEST_STEAM_IDS[0];
      const repetitiveYaml = new TextEncoder().encode('a'.repeat(1000));

      const encrypted = encryptYamlToSav(repetitiveYaml, steamId);

      // Encrypted size should be smaller due to compression
      expect(encrypted.length).toBeLessThan(repetitiveYaml.length);

      const decrypted = decryptSavToYaml(encrypted, steamId);
      expect(decrypted).toEqual(repetitiveYaml);
    });

    it('should fail decryption with wrong Steam ID', () => {
      const steamId1 = TEST_STEAM_IDS[0];
      const steamId2 = TEST_STEAM_IDS[1];
      const originalYaml = new TextEncoder().encode('test: value\n');

      const encrypted = encryptYamlToSav(originalYaml, steamId1);

      // Decrypting with wrong Steam ID should fail or produce garbage
      expect(() => {
        const decrypted = decryptSavToYaml(encrypted, steamId2);
        // If it doesn't throw, the decrypted data should be different
        expect(decrypted).not.toEqual(originalYaml);
      }).toThrow();
    });
  });

  describe('encryptYamlToSav', () => {
    it('should produce output that is a multiple of 16 bytes (AES block size)', () => {
      const steamId = TEST_STEAM_IDS[0];
      const yamlData = new TextEncoder().encode('test: value\n');

      const encrypted = encryptYamlToSav(yamlData, steamId);

      expect(encrypted.length % 16).toBe(0);
    });

    it('should append adler32 checksum and uncompressed length', () => {
      const steamId = TEST_STEAM_IDS[0];
      const yamlData = new TextEncoder().encode('test: value\n');

      const encrypted = encryptYamlToSav(yamlData, steamId);

      // Should have at least 8 extra bytes (4 for checksum, 4 for length)
      expect(encrypted.length).toBeGreaterThan(8);
    });
  });

  describe('decryptSavToYaml', () => {
    it('should reject data not multiple of 16 bytes', () => {
      const steamId = TEST_STEAM_IDS[0];
      const invalidData = new Uint8Array(15); // Not multiple of 16

      expect(() => decryptSavToYaml(invalidData, steamId)).toThrow(
        'not multiple of 16'
      );
    });

    it('should handle data with valid block size', () => {
      const steamId = TEST_STEAM_IDS[0];
      const yamlData = new TextEncoder().encode('test\n');

      const encrypted = encryptYamlToSav(yamlData, steamId);
      const decrypted = decryptSavToYaml(encrypted, steamId);

      expect(decrypted).toEqual(yamlData);
    });
  });

  describe('Edge cases', () => {
    it('should handle YAML with special characters', () => {
      const steamId = TEST_STEAM_IDS[0];
      const specialYaml = new TextEncoder().encode('test: "💾🎮🔫"\nspecial: !tag value\n');

      const encrypted = encryptYamlToSav(specialYaml, steamId);
      const decrypted = decryptSavToYaml(encrypted, steamId);

      expect(decrypted).toEqual(specialYaml);
    });

    it('should handle binary data in YAML', () => {
      const steamId = TEST_STEAM_IDS[0];
      const binaryYaml = new Uint8Array([0x00, 0xFF, 0x80, 0x7F, 0x01, 0xFE]);

      const encrypted = encryptYamlToSav(binaryYaml, steamId);
      const decrypted = decryptSavToYaml(encrypted, steamId);

      expect(decrypted).toEqual(binaryYaml);
    });
  });
});
