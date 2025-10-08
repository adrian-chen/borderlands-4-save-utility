import * as yaml from 'js-yaml';
import { decodeItemSerial, encodeItemSerial } from './items';
import type { DecodedItem, DecodedItemYaml, YamlData } from './types';

/**
 * Custom YAML schema to handle unknown tags from Borderlands save files
 * This mimics Python's unknown_constructor which catches all ! tags
 */
const BORDERLANDS_SCHEMA = yaml.DEFAULT_SCHEMA.extend({
  implicit: [],
  explicit: [
    new yaml.Type('!', {
      kind: 'scalar',
      multi: true,
      resolve: () => true,
      construct: (data) => data,
    }),
    new yaml.Type('!', {
      kind: 'sequence',
      multi: true,
      resolve: () => true,
      construct: (data) => data,
    }),
    new yaml.Type('!', {
      kind: 'mapping',
      multi: true,
      resolve: () => true,
      construct: (data) => data,
    }),
  ],
});

/**
 * Recursively search YAML data for item serials and decode them
 */
export function findAndDecodeSerials(yamlData: YamlData): Record<string, DecodedItem> {
  const decodedSerials: Record<string, DecodedItem> = {};

  function searchDict(obj: unknown, path: string = ''): void {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, i) => {
          const newPath = `${path}[${i}]`;
          if (typeof item === 'string' && item.startsWith('@Ug')) {
            const decoded = decodeItemSerial(item);
            if (decoded.confidence !== 'none') {
              decodedSerials[newPath] = decoded;
            }
          } else if (typeof item === 'object') {
            searchDict(item, newPath);
          }
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string' && value.startsWith('@Ug')) {
            const decoded = decodeItemSerial(value);
            if (decoded.confidence !== 'none') {
              decodedSerials[newPath] = decoded;
            }
          } else if (typeof value === 'object') {
            searchDict(value, newPath);
          }
        });
      }
    }
  }

  searchDict(yamlData);
  return decodedSerials;
}

/**
 * Insert decoded items section into YAML data
 */
export function insertDecodedItems(
  yamlData: YamlData,
  decodedSerials: Record<string, DecodedItem>
): YamlData {
  const result = { ...yamlData };

  const decodedItemsSection: Record<string, DecodedItemYaml> = {};

  Object.entries(decodedSerials).forEach(([path, decodedItem]) => {
    const itemInfo: DecodedItemYaml = {
      original_serial: decodedItem.serial,
      item_type: decodedItem.item_type,
      category: decodedItem.item_category,
      confidence: decodedItem.confidence,
      stats: {}
    };

    if (decodedItem.stats.primary_stat !== undefined) {
      itemInfo.stats.primary_stat = decodedItem.stats.primary_stat;
    }
    if (decodedItem.stats.secondary_stat !== undefined) {
      itemInfo.stats.secondary_stat = decodedItem.stats.secondary_stat;
    }
    if (decodedItem.stats.level !== undefined) {
      itemInfo.stats.level = decodedItem.stats.level;
    }
    if (decodedItem.stats.rarity !== undefined) {
      itemInfo.stats.rarity = decodedItem.stats.rarity;
    }
    if (decodedItem.stats.manufacturer !== undefined) {
      itemInfo.stats.manufacturer = decodedItem.stats.manufacturer;
    }
    if (decodedItem.stats.item_class !== undefined) {
      itemInfo.stats.item_class = decodedItem.stats.item_class;
    }

    decodedItemsSection[path] = itemInfo;
  });

  result['_DECODED_ITEMS'] = decodedItemsSection;

  return result;
}

/**
 * Extract and encode serials from _DECODED_ITEMS section
 */
export function extractAndEncodeSerials(yamlData: YamlData): YamlData {
  const result = { ...yamlData };

  if (!('_DECODED_ITEMS' in yamlData)) {
    return result;
  }

  const decodedItemsSection = yamlData['_DECODED_ITEMS'] as Record<string, DecodedItemYaml>;

  Object.entries(decodedItemsSection).forEach(([path, itemInfo]) => {
    const stats: Record<string, number> = {};

    if ('stats' in itemInfo) {
      Object.assign(stats, itemInfo.stats);
    }

    const decodedItem: DecodedItem = {
      serial: itemInfo.original_serial,
      item_type: itemInfo.item_type,
      item_category: itemInfo.category,
      length: 0,
      stats: {
        primary_stat: stats.primary_stat,
        secondary_stat: stats.secondary_stat,
        level: stats.level,
        rarity: stats.rarity,
        manufacturer: stats.manufacturer,
        item_class: stats.item_class
      },
      raw_fields: {},
      confidence: itemInfo.confidence as 'high' | 'medium' | 'low' | 'none'
    };

    const newSerial = encodeItemSerial(decodedItem);
    setNestedValue(result, path, newSerial);
  });

  delete result['_DECODED_ITEMS'];

  return result;
}

/**
 * Set a nested value in an object using a path string
 */
function setNestedValue(data: YamlData, path: string, value: string): void {
  const parts = path.split('.');
  let current: unknown = data;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (part.includes('[') && part.includes(']')) {
      const [key, indexStr] = part.split('[');
      const index = parseInt(indexStr.replace(']', ''));
      current = (current as Record<string, unknown>)[key];
      current = (current as unknown[])[index];
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  const finalPart = parts[parts.length - 1];
  if (finalPart.includes('[') && finalPart.includes(']')) {
    const [key, indexStr] = finalPart.split('[');
    const index = parseInt(indexStr.replace(']', ''));
    ((current as Record<string, unknown>)[key] as unknown[])[index] = value;
  } else {
    (current as Record<string, unknown>)[finalPart] = value;
  }
}

/**
 * Parse YAML string to object
 * Uses custom schema to handle unknown YAML tags from Borderlands save files
 */
export function parseYaml(yamlString: string): YamlData {
  return yaml.load(yamlString, { schema: BORDERLANDS_SCHEMA }) as YamlData;
}

/**
 * Stringify object to YAML
 */
export function stringifyYaml(data: YamlData): string {
  return yaml.dump(data, {
    lineWidth: -1,
    noRefs: true
  });
}
