import { describe, it, expect } from 'vitest';
import { decodeItemSerial, encodeItemSerial } from '../items';
import { bitPackEncode } from '../codec';
import type { DecodedItem } from '../types';

describe('Items - Serial Decoding/Encoding', () => {
  describe('decodeItemSerial', () => {
    describe('Weapon type (r)', () => {
      it('should decode weapon serial with correct type', () => {
        // Create a test weapon serial
        const testData = new Uint8Array(24);
        testData[0] = 0x10; // primary_stat low byte
        testData[1] = 0x05; // primary_stat high byte + rarity
        testData[4] = 0x03; // manufacturer
        testData[8] = 0x02; // item_class
        testData[12] = 0x20; // secondary_stat low byte
        testData[13] = 0x03; // secondary_stat high byte

        const serial = bitPackEncode(testData, '@Ugr');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('r');
        expect(decoded.item_category).toBe('weapon');
        expect(decoded.confidence).toBe('high');
        expect(decoded.stats.primary_stat).toBeDefined();
      });

      it('should extract weapon stats from correct byte offsets', () => {
        const testData = new Uint8Array(24);
        const view = new DataView(testData.buffer);
        view.setUint16(0, 1234, true); // primary_stat at offset 0
        view.setUint16(12, 5678, true); // secondary_stat at offset 12
        testData[1] = 3; // rarity at byte 1
        testData[4] = 5; // manufacturer at byte 4
        testData[8] = 7; // item_class at byte 8

        const serial = bitPackEncode(testData, '@Ugr');
        const decoded = decodeItemSerial(serial);

        expect(decoded.stats.primary_stat).toBe(1234);
        expect(decoded.stats.secondary_stat).toBe(5678);
        expect(decoded.stats.manufacturer).toBe(5);
        expect(decoded.stats.item_class).toBe(7);
      });
    });

    describe('Equipment type (e)', () => {
      it('should decode equipment type e with correct type', () => {
        const testData = new Uint8Array(40);
        testData[1] = 49; // manufacturer = 49 for high confidence
        testData[3] = 0x02; // item_class
        testData[9] = 0x03; // rarity

        const serial = bitPackEncode(testData, '@Uge');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('e');
        expect(decoded.item_category).toBe('equipment');
        expect(decoded.confidence).toBe('high');
      });

      it('should extract equipment e stats from correct byte offsets', () => {
        const testData = new Uint8Array(40);
        const view = new DataView(testData.buffer);
        view.setUint16(2, 2345, true); // primary_stat at offset 2
        view.setUint16(8, 6789, true); // secondary_stat at offset 8
        view.setUint16(10, 50, true); // level at offset 10
        testData[1] = 49; // manufacturer
        testData[3] = 4; // item_class
        testData[9] = 2; // rarity

        const serial = bitPackEncode(testData, '@Uge');
        const decoded = decodeItemSerial(serial);

        expect(decoded.stats.primary_stat).toBe(2345);
        expect(decoded.stats.secondary_stat).toBe(6789);
        expect(decoded.stats.level).toBe(50);
        expect(decoded.stats.manufacturer).toBe(49);
        expect(decoded.stats.item_class).toBe(4);
        expect(decoded.stats.rarity).toBe(2);
      });
    });

    describe('Equipment type (d)', () => {
      it('should decode equipment type d with correct type', () => {
        const testData = new Uint8Array(32);
        testData[5] = 15; // manufacturer = 15 for high confidence

        const serial = bitPackEncode(testData, '@Ugd');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('d');
        expect(decoded.item_category).toBe('equipment_alt');
        expect(decoded.confidence).toBe('high');
      });

      it('should extract equipment d stats from correct byte offsets', () => {
        const testData = new Uint8Array(32);
        const view = new DataView(testData.buffer);
        view.setUint16(4, 3456, true); // primary_stat at offset 4
        view.setUint16(8, 7890, true); // secondary_stat at offset 8
        view.setUint16(10, 60, true); // level at offset 10
        testData[5] = 15; // manufacturer
        testData[6] = 3; // item_class
        testData[14] = 1; // rarity

        const serial = bitPackEncode(testData, '@Ugd');
        const decoded = decodeItemSerial(serial);

        expect(decoded.stats.primary_stat).toBe(3456);
        expect(decoded.stats.secondary_stat).toBe(7890);
        expect(decoded.stats.level).toBe(60);
        expect(decoded.stats.manufacturer).toBe(15);
        expect(decoded.stats.item_class).toBe(3);
        expect(decoded.stats.rarity).toBe(1);
      });
    });

    describe('Other item types', () => {
      it('should decode type w as weapon_special', () => {
        const testData = new Uint8Array(16);
        const serial = bitPackEncode(testData, '@Ugw');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('w');
        expect(decoded.item_category).toBe('weapon_special');
        expect(decoded.confidence).toBe('low');
      });

      it('should decode type u as utility', () => {
        const testData = new Uint8Array(16);
        const serial = bitPackEncode(testData, '@Ugu');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('u');
        expect(decoded.item_category).toBe('utility');
      });

      it('should decode type f as consumable', () => {
        const testData = new Uint8Array(16);
        const serial = bitPackEncode(testData, '@Ugf');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('f');
        expect(decoded.item_category).toBe('consumable');
      });

      it('should decode type ! as special', () => {
        const testData = new Uint8Array(16);
        const serial = bitPackEncode(testData, '@Ug!');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('!');
        expect(decoded.item_category).toBe('special');
      });
    });

    describe('Error handling', () => {
      it('should handle invalid serials gracefully', () => {
        const invalidSerial = 'invalid';
        const decoded = decodeItemSerial(invalidSerial);

        expect(decoded.item_type).toBe('error');
        expect(decoded.item_category).toBe('decode_failed');
        expect(decoded.confidence).toBe('none');
      });

      it('should include error message in raw_fields on failure', () => {
        const invalidSerial = 'invalid';
        const decoded = decodeItemSerial(invalidSerial);

        expect(decoded.raw_fields).toHaveProperty('error');
        expect(decoded.raw_fields.error).toBeDefined();
      });
    });
  });

  describe('encodeItemSerial', () => {
    describe('Weapon encoding (type r)', () => {
      it('should encode modified weapon stats', () => {
        const testData = new Uint8Array(24);
        const view = new DataView(testData.buffer);
        view.setUint16(0, 1000, true);
        view.setUint16(12, 2000, true);

        const originalSerial = bitPackEncode(testData, '@Ugr');
        const decoded = decodeItemSerial(originalSerial);

        // Modify stats
        decoded.stats.primary_stat = 9999;
        decoded.stats.secondary_stat = 8888;

        const reencoded = encodeItemSerial(decoded);
        const redecoded = decodeItemSerial(reencoded);

        expect(redecoded.stats.primary_stat).toBe(9999);
        expect(redecoded.stats.secondary_stat).toBe(8888);
      });

      it('should preserve item type prefix when encoding', () => {
        const testData = new Uint8Array(24);
        const originalSerial = bitPackEncode(testData, '@Ugr');
        const decoded = decodeItemSerial(originalSerial);

        const reencoded = encodeItemSerial(decoded);

        expect(reencoded).toMatch(/^@Ugr/);
      });
    });

    describe('Equipment encoding (type e)', () => {
      it('should encode modified equipment e stats', () => {
        const testData = new Uint8Array(40);
        const view = new DataView(testData.buffer);
        view.setUint16(2, 500, true);
        view.setUint16(8, 600, true);

        const originalSerial = bitPackEncode(testData, '@Uge');
        const decoded = decodeItemSerial(originalSerial);

        decoded.stats.primary_stat = 7777;
        decoded.stats.secondary_stat = 6666;

        const reencoded = encodeItemSerial(decoded);
        const redecoded = decodeItemSerial(reencoded);

        expect(redecoded.stats.primary_stat).toBe(7777);
        expect(redecoded.stats.secondary_stat).toBe(6666);
      });
    });

    describe('Equipment encoding (type d)', () => {
      it('should encode modified equipment d stats', () => {
        const testData = new Uint8Array(32);
        const view = new DataView(testData.buffer);
        view.setUint16(4, 300, true);
        view.setUint16(8, 400, true);

        const originalSerial = bitPackEncode(testData, '@Ugd');
        const decoded = decodeItemSerial(originalSerial);

        decoded.stats.primary_stat = 5555;
        decoded.stats.secondary_stat = 4444;

        const reencoded = encodeItemSerial(decoded);
        const redecoded = decodeItemSerial(reencoded);

        expect(redecoded.stats.primary_stat).toBe(5555);
        expect(redecoded.stats.secondary_stat).toBe(4444);
      });
    });

    describe('Round-trip encoding', () => {
      it('should preserve unmodified items', () => {
        const testData = new Uint8Array(24);
        const view = new DataView(testData.buffer);
        view.setUint16(0, 123, true);
        testData[1] = 2;
        testData[4] = 5;

        const originalSerial = bitPackEncode(testData, '@Ugr');
        const decoded = decodeItemSerial(originalSerial);
        const reencoded = encodeItemSerial(decoded);
        const redecoded = decodeItemSerial(reencoded);

        expect(redecoded.stats).toEqual(decoded.stats);
      });
    });

    describe('Error handling', () => {
      it('should return original serial on encode failure', () => {
        const invalidItem: DecodedItem = {
          serial: '@UgrInvalid',
          item_type: 'r',
          item_category: 'weapon',
          length: 0,
          stats: {},
          raw_fields: {},
          confidence: 'none',
        };

        const result = encodeItemSerial(invalidItem);
        expect(result).toBe('@UgrInvalid');
      });
    });
  });
});
