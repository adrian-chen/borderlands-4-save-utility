import { describe, it, expect } from 'vitest';
import {
  findAndDecodeSerials,
  insertDecodedItems,
  extractAndEncodeSerials,
  parseYaml,
  stringifyYaml,
} from '../yaml';
import { bitPackEncode } from '../codec';
import type { YamlData } from '../types';
import { WEAPON_SERIALS } from '../../../tests/fixtures/sample-serials';

describe('YAML Transformations', () => {
  describe('findAndDecodeSerials', () => {
    it('should find serials in flat YAML structure', () => {
      const testData = new Uint8Array(24);
      const view = new DataView(testData.buffer);
      view.setUint16(0, 1234, true);
      const serial = bitPackEncode(testData, '@Ugr');

      const yamlData: YamlData = {
        weapon: serial,
      };

      const decoded = findAndDecodeSerials(yamlData);

      expect(Object.keys(decoded).length).toBe(1);
      expect(decoded['weapon']).toBeDefined();
      expect(decoded['weapon'].serial).toBe(serial);
    });

    it('should find serials in nested YAML structure', () => {
      const testData = new Uint8Array(24);
      const serial = bitPackEncode(testData, '@Ugr');

      const yamlData: YamlData = {
        inventory: {
          items: {
            weapon1: serial,
          },
        },
      };

      const decoded = findAndDecodeSerials(yamlData);

      expect(Object.keys(decoded).length).toBe(1);
      expect(decoded['inventory.items.weapon1']).toBeDefined();
    });

    it('should find serials in arrays', () => {
      const testData = new Uint8Array(24);
      const serial1 = bitPackEncode(testData, '@Ugr');
      const serial2 = bitPackEncode(testData, '@Uge');

      const yamlData: YamlData = {
        items: [serial1, serial2],
      };

      const decoded = findAndDecodeSerials(yamlData);

      expect(Object.keys(decoded).length).toBe(2);
      expect(decoded['items[0]']).toBeDefined();
      expect(decoded['items[1]']).toBeDefined();
    });

    it('should find multiple serials in complex structure', () => {
      const testData = new Uint8Array(24);
      const serial1 = bitPackEncode(testData, '@Ugr');
      const serial2 = bitPackEncode(testData, '@Uge');
      const serial3 = bitPackEncode(testData, '@Ugd');

      const yamlData: YamlData = {
        player: {
          inventory: {
            weapons: [serial1],
            equipment: [serial2, serial3],
          },
        },
      };

      const decoded = findAndDecodeSerials(yamlData);

      expect(Object.keys(decoded).length).toBe(3);
      expect(decoded['player.inventory.weapons[0]']).toBeDefined();
      expect(decoded['player.inventory.equipment[0]']).toBeDefined();
      expect(decoded['player.inventory.equipment[1]']).toBeDefined();
    });

    it('should ignore non-serial strings', () => {
      const yamlData: YamlData = {
        name: 'Player Name',
        level: 50,
        description: 'Not a serial',
      };

      const decoded = findAndDecodeSerials(yamlData);

      expect(Object.keys(decoded).length).toBe(0);
    });

    it('should only include items with non-none confidence', () => {
      // Strings not starting with '@Ug' are ignored by findAndDecodeSerials
      const yamlData: YamlData = {
        unknown: 'not-a-serial',
      };

      const decoded = findAndDecodeSerials(yamlData);

      // Non-serial strings are not processed at all
      expect(Object.keys(decoded).length).toBe(0);
    });
  });

  describe('insertDecodedItems', () => {
    it('should insert _DECODED_ITEMS section', () => {
      const testData = new Uint8Array(24);
      const view = new DataView(testData.buffer);
      view.setUint16(0, 1234, true);
      testData[1] = 3; // rarity
      const serial = bitPackEncode(testData, '@Ugr');

      const yamlData: YamlData = {
        weapon: serial,
      };

      const decoded = findAndDecodeSerials(yamlData);
      const result = insertDecodedItems(yamlData, decoded);

      expect(result).toHaveProperty('_DECODED_ITEMS');
      expect(result.weapon).toBe(serial); // Original should remain
    });

    it('should include item metadata in _DECODED_ITEMS', () => {
      const testData = new Uint8Array(24);
      const view = new DataView(testData.buffer);
      view.setUint16(0, 5678, true);
      const serial = bitPackEncode(testData, '@Ugr');

      const yamlData: YamlData = {
        weapon: serial,
      };

      const decoded = findAndDecodeSerials(yamlData);
      const result = insertDecodedItems(yamlData, decoded);

      const decodedItems = result['_DECODED_ITEMS'] as Record<string, any>;
      expect(decodedItems['weapon']).toBeDefined();
      expect(decodedItems['weapon'].original_serial).toBe(serial);
      expect(decodedItems['weapon'].item_type).toBe('r');
      expect(decodedItems['weapon'].category).toBe('weapon');
      expect(decodedItems['weapon'].confidence).toBeDefined();
    });

    it('should include stats in _DECODED_ITEMS', () => {
      // Use real weapon serial from save file with known stats
      const serial = WEAPON_SERIALS[0]; // primary_stat: 5294

      const yamlData: YamlData = {
        weapon: serial,
      };

      const decoded = findAndDecodeSerials(yamlData);
      const result = insertDecodedItems(yamlData, decoded);

      const decodedItems = result['_DECODED_ITEMS'] as Record<string, any>;
      expect(decodedItems['weapon'].stats).toBeDefined();
      expect(decodedItems['weapon'].stats.primary_stat).toBe(5294);
    });
  });

  describe('extractAndEncodeSerials', () => {
    it('should extract and encode serials from _DECODED_ITEMS', () => {
      const testData = new Uint8Array(24);
      const view = new DataView(testData.buffer);
      view.setUint16(0, 1000, true);
      const originalSerial = bitPackEncode(testData, '@Ugr');

      const yamlData: YamlData = {
        weapon: originalSerial,
        _DECODED_ITEMS: {
          weapon: {
            original_serial: originalSerial,
            item_type: 'r',
            category: 'weapon',
            confidence: 'high',
            stats: {
              primary_stat: 9999, // Modified
            },
          },
        },
      };

      const result = extractAndEncodeSerials(yamlData);

      expect(result.weapon).not.toBe(originalSerial); // Should be modified
      expect(result).not.toHaveProperty('_DECODED_ITEMS'); // Should be removed
    });

    it('should remove _DECODED_ITEMS section after encoding', () => {
      const yamlData: YamlData = {
        _DECODED_ITEMS: {},
      };

      const result = extractAndEncodeSerials(yamlData);

      expect(result).not.toHaveProperty('_DECODED_ITEMS');
    });

    it('should handle YAML without _DECODED_ITEMS', () => {
      const yamlData: YamlData = {
        weapon: 'some value',
      };

      const result = extractAndEncodeSerials(yamlData);

      expect(result).toEqual(yamlData);
    });

    it('should update nested paths correctly', () => {
      const testData = new Uint8Array(24);
      const serial = bitPackEncode(testData, '@Ugr');

      const yamlData: YamlData = {
        inventory: {
          items: {
            weapon: serial,
          },
        },
        _DECODED_ITEMS: {
          'inventory.items.weapon': {
            original_serial: serial,
            item_type: 'r',
            category: 'weapon',
            confidence: 'high',
            stats: {
              primary_stat: 5555,
            },
          },
        },
      };

      const result = extractAndEncodeSerials(yamlData);

      expect((result.inventory as any).items.weapon).not.toBe(serial);
      expect(result).not.toHaveProperty('_DECODED_ITEMS');
    });

    it('should update array indices correctly', () => {
      const testData = new Uint8Array(24);
      const serial = bitPackEncode(testData, '@Ugr');

      const yamlData: YamlData = {
        items: [serial],
        _DECODED_ITEMS: {
          'items[0]': {
            original_serial: serial,
            item_type: 'r',
            category: 'weapon',
            confidence: 'high',
            stats: {
              primary_stat: 7777,
            },
          },
        },
      };

      const result = extractAndEncodeSerials(yamlData);

      expect((result.items as any[])[0]).not.toBe(serial);
    });
  });

  describe('parseYaml', () => {
    it('should parse valid YAML string', () => {
      const yamlString = 'key: value\nfoo: bar\n';
      const parsed = parseYaml(yamlString);

      expect(parsed).toEqual({ key: 'value', foo: 'bar' });
    });

    it('should parse YAML with nested objects', () => {
      const yamlString = 'parent:\n  child: value\n';
      const parsed = parseYaml(yamlString);

      expect(parsed).toHaveProperty('parent');
      expect((parsed.parent as any).child).toBe('value');
    });

    it('should parse YAML with arrays', () => {
      const yamlString = 'items:\n  - item1\n  - item2\n';
      const parsed = parseYaml(yamlString);

      expect((parsed.items as any[])).toHaveLength(2);
      expect((parsed.items as any[])[0]).toBe('item1');
    });
  });

  describe('stringifyYaml', () => {
    it('should stringify object to YAML', () => {
      const data: YamlData = { key: 'value', foo: 'bar' };
      const yamlString = stringifyYaml(data);

      expect(yamlString).toContain('key:');
      expect(yamlString).toContain('value');
      expect(yamlString).toContain('foo:');
      expect(yamlString).toContain('bar');
    });

    it('should stringify nested objects', () => {
      const data: YamlData = {
        parent: {
          child: 'value',
        },
      };
      const yamlString = stringifyYaml(data);

      expect(yamlString).toContain('parent:');
      expect(yamlString).toContain('child:');
    });

    it('should stringify arrays', () => {
      const data: YamlData = {
        items: ['item1', 'item2'],
      };
      const yamlString = stringifyYaml(data);

      expect(yamlString).toContain('items:');
      expect(yamlString).toContain('item1');
      expect(yamlString).toContain('item2');
    });
  });

  describe('Round-trip YAML operations', () => {
    it('should parse and stringify YAML without data loss', () => {
      const original: YamlData = {
        key: 'value',
        nested: {
          foo: 'bar',
        },
        items: [1, 2, 3],
      };

      const stringified = stringifyYaml(original);
      const parsed = parseYaml(stringified);

      expect(parsed).toEqual(original);
    });
  });
});
