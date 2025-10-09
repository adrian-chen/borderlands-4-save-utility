import { describe, it, expect } from 'vitest';
import { decodeItemSerial, encodeItemSerial } from '../items';
import { bitPackEncode } from '../codec';
import type { DecodedItem } from '../types';
import { WEAPON_SERIALS, EQUIPMENT_E_SERIALS } from '../../../tests/fixtures/sample-serials';

describe('Items - Serial Decoding/Encoding', () => {
  describe('decodeItemSerial', () => {
    describe('Weapon type (r)', () => {
      it('should decode weapon serial with correct type', () => {
        // Use real weapon serial from save file (high confidence, length 24)
        const serial = WEAPON_SERIALS[0]; // '@Ugr$lGm/&<N!od8XM-}RPG}pu$8r1oA0ss'
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('r');
        expect(decoded.item_category).toBe('weapon');
        expect(decoded.confidence).toBe('high');
        expect(decoded.stats.primary_stat).toBeDefined();
      });

      it('should extract weapon stats from correct byte offsets', () => {
        // Use real weapon serial with known stats: primary_stat: 5294, secondary_stat: 10074
        const serial = WEAPON_SERIALS[0];
        const decoded = decodeItemSerial(serial);

        expect(decoded.stats.primary_stat).toBe(5294);
        expect(decoded.stats.secondary_stat).toBe(10074);
        expect(decoded.stats.manufacturer).toBe(252);
        expect(decoded.stats.item_class).toBe(161);
        expect(decoded.stats.rarity).toBe(20);
      });
    });

    describe('Equipment type (e)', () => {
      it('should decode equipment type e with correct type', () => {
        // Use real equipment serial from save file
        const serial = EQUIPMENT_E_SERIALS[0]; // '@Uge8;)m/$ig!qAMMM!jz*=uq#Y*(G{~DgX'
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('e');
        expect(decoded.item_category).toBe('equipment');
        // This serial has medium confidence (not high) based on real data
        expect(decoded.confidence).toBe('medium');
      });

      it('should extract equipment e stats from correct byte offsets', () => {
        // Use real equipment serial with known stats: primary_stat: 59025, secondary_stat: 936
        const serial = EQUIPMENT_E_SERIALS[0];
        const decoded = decodeItemSerial(serial);

        expect(decoded.stats.primary_stat).toBe(59025);
        expect(decoded.stats.secondary_stat).toBe(936);
        expect(decoded.stats.manufacturer).toBe(202);
        expect(decoded.stats.item_class).toBe(230);
        expect(decoded.stats.rarity).toBe(3);
      });
    });

    describe('Equipment type (d)', () => {
      it.skip('should decode equipment type d with correct type', () => {
        // TODO: Add real type 'd' serial from save file when found
        const testData = new Uint8Array(32);
        testData[5] = 15;

        const serial = bitPackEncode(testData, '@Ugd');
        const decoded = decodeItemSerial(serial);

        expect(decoded.item_type).toBe('d');
        expect(decoded.item_category).toBe('equipment_alt');
        expect(decoded.confidence).toBe('medium');
      });

      it.skip('should extract equipment d stats from correct byte offsets', () => {
        // TODO: Add real type 'd' serial from save file when found
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
      it('should handle unknown serial types gracefully', () => {
        // Serials that don't start with '@Ug' are decoded as unknown type '?'
        const invalidSerial = 'invalid';
        const decoded = decodeItemSerial(invalidSerial);

        expect(decoded.item_type).toBe('?');
        expect(decoded.item_category).toBe('unknown');
        expect(decoded.confidence).toBe('low');
      });

      it('should handle serials without proper prefix', () => {
        const invalidSerial = 'ABCDEF';
        const decoded = decodeItemSerial(invalidSerial);

        expect(decoded.item_type).toBe('?');
        expect(decoded.item_category).toBe('unknown');
      });
    });
  });

  describe('encodeItemSerial', () => {
    describe('Weapon encoding (type r)', () => {
      it('should encode modified weapon stats', () => {
        // Use real weapon serial from save file
        const originalSerial = WEAPON_SERIALS[0];
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
        // Use real weapon serial from save file
        const originalSerial = WEAPON_SERIALS[0];
        const decoded = decodeItemSerial(originalSerial);

        const reencoded = encodeItemSerial(decoded);

        expect(reencoded).toMatch(/^@Ugr/);
      });
    });

    describe('Equipment encoding (type e)', () => {
      it('should encode modified equipment e stats', () => {
        // Use real equipment serial from save file
        const originalSerial = EQUIPMENT_E_SERIALS[0];
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
      it.skip('should encode modified equipment d stats', () => {
        // TODO: Add real type 'd' serial from save file when found
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
        // Use real weapon serial from save file
        const originalSerial = WEAPON_SERIALS[0];
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
