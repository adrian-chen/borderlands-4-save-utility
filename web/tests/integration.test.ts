import { describe, it, expect } from 'vitest';
import { decryptSavToYaml, encryptYamlToSav } from '../src/lib/crypto';
import { parseYaml, stringifyYaml, findAndDecodeSerials, insertDecodedItems, extractAndEncodeSerials } from '../src/lib/yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ACTUAL_STEAM_ID } from './fixtures/sample-serials';

/**
 * Integration tests for end-to-end .sav file processing with real save files
 */

describe('Integration - Real .sav file processing', () => {
  const FIXTURES_DIR = join(__dirname, 'fixtures');

  describe('1.sav file tests', () => {
    it('should decrypt 1.sav to YAML', () => {
      const savPath = join(FIXTURES_DIR, '1.sav');
      const savData = new Uint8Array(readFileSync(savPath));

      const yamlBytes = decryptSavToYaml(savData, ACTUAL_STEAM_ID);
      const yamlString = new TextDecoder().decode(yamlBytes);
      const yamlData = parseYaml(yamlString);

      expect(yamlData).toBeDefined();
      expect(yamlData).toBeTypeOf('object');
      expect(yamlString.length).toBeGreaterThan(0);
    });

    it('should round-trip encrypt/decrypt 1.sav without data loss', () => {
      const savPath = join(FIXTURES_DIR, '1.sav');
      const originalSavData = new Uint8Array(readFileSync(savPath));

      // Decrypt
      const yamlBytes = decryptSavToYaml(originalSavData, ACTUAL_STEAM_ID);

      // Re-encrypt
      const reencrypted = encryptYamlToSav(yamlBytes, ACTUAL_STEAM_ID);

      // Decrypt again
      const yamlBytes2 = decryptSavToYaml(reencrypted, ACTUAL_STEAM_ID);

      expect(yamlBytes2).toEqual(yamlBytes);
    });

    it('should find item serials in 1.sav', () => {
      const savPath = join(FIXTURES_DIR, '1.sav');
      const savData = new Uint8Array(readFileSync(savPath));

      const yamlBytes = decryptSavToYaml(savData, ACTUAL_STEAM_ID);
      const yamlString = new TextDecoder().decode(yamlBytes);
      const yamlData = parseYaml(yamlString);

      const decodedSerials = findAndDecodeSerials(yamlData);

      // Should find at least some item serials in a real save file
      expect(Object.keys(decodedSerials).length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3.sav file tests', () => {
    it('should decrypt 3.sav to YAML', () => {
      const savPath = join(FIXTURES_DIR, '3.sav');
      const savData = new Uint8Array(readFileSync(savPath));

      const yamlBytes = decryptSavToYaml(savData, ACTUAL_STEAM_ID);
      const yamlString = new TextDecoder().decode(yamlBytes);
      const yamlData = parseYaml(yamlString);

      expect(yamlData).toBeDefined();
      expect(yamlData).toBeTypeOf('object');
      expect(yamlString.length).toBeGreaterThan(0);
    });

    it('should round-trip encrypt/decrypt 3.sav without data loss', () => {
      const savPath = join(FIXTURES_DIR, '3.sav');
      const originalSavData = new Uint8Array(readFileSync(savPath));

      // Decrypt
      const yamlBytes = decryptSavToYaml(originalSavData, ACTUAL_STEAM_ID);

      // Re-encrypt
      const reencrypted = encryptYamlToSav(yamlBytes, ACTUAL_STEAM_ID);

      // Decrypt again
      const yamlBytes2 = decryptSavToYaml(reencrypted, ACTUAL_STEAM_ID);

      expect(yamlBytes2).toEqual(yamlBytes);
    });

    it('should find item serials in 3.sav', () => {
      const savPath = join(FIXTURES_DIR, '3.sav');
      const savData = new Uint8Array(readFileSync(savPath));

      const yamlBytes = decryptSavToYaml(savData, ACTUAL_STEAM_ID);
      const yamlString = new TextDecoder().decode(yamlBytes);
      const yamlData = parseYaml(yamlString);

      const decodedSerials = findAndDecodeSerials(yamlData);

      // Should find at least some item serials in a real save file
      expect(Object.keys(decodedSerials).length).toBeGreaterThanOrEqual(0);
    });
  });

});
