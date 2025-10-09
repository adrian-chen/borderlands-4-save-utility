import { bitPackDecode, bitPackEncode } from './codec';
import type { DecodedItem, ItemStats } from './types';

/**
 * Extract common fields from decoded item data
 */
function extractFields(data: Uint8Array): Record<string, number | number[] | [number, number][]> {
  const fields: Record<string, number | number[] | [number, number][]> = {};

  // Extract 32-bit values
  if (data.length >= 4) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    fields['header_le'] = view.getUint32(0, true);
    fields['header_be'] = view.getUint32(0, false);
  }

  if (data.length >= 8) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    fields['field2_le'] = view.getUint32(4, true);
  }

  if (data.length >= 12) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    fields['field3_le'] = view.getUint32(8, true);
  }

  // Extract 16-bit values
  const stats16: Array<[number, number]> = [];
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  for (let i = 0; i < Math.min(data.length - 1, 20); i += 2) {
    const val16 = view.getUint16(i, true);
    fields[`val16_at_${i}`] = val16;
    if (val16 >= 100 && val16 <= 10000) {
      stats16.push([i, val16]);
    }
  }
  fields['potential_stats'] = stats16;

  // Extract byte values
  const flags: Array<[number, number]> = [];
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const byteVal = data[i];
    fields[`byte_${i}`] = byteVal;
    if (byteVal < 100) {
      flags.push([i, byteVal]);
    }
  }
  fields['potential_flags'] = flags;

  return fields;
}

/**
 * Decode weapon (type 'r')
 */
function decodeWeapon(data: Uint8Array, serial: string): DecodedItem {
  const fields = extractFields(data);
  const stats: ItemStats = {};

  if ('val16_at_0' in fields) {
    stats.primary_stat = fields['val16_at_0'] as number;
  }

  if ('val16_at_12' in fields) {
    stats.secondary_stat = fields['val16_at_12'] as number;
  }

  if ('byte_4' in fields) {
    stats.manufacturer = fields['byte_4'] as number;
  }

  if ('byte_8' in fields) {
    stats.item_class = fields['byte_8'] as number;
  }

  if ('byte_1' in fields) {
    stats.rarity = fields['byte_1'] as number;
  }

  if ('byte_13' in fields && (fields['byte_13'] === 2 || fields['byte_13'] === 34)) {
    stats.level = fields['byte_13'] as number;
  }

  const confidence = (data.length === 24 || data.length === 26) ? 'high' : 'medium';

  return {
    serial,
    item_type: 'r',
    item_category: 'weapon',
    length: data.length,
    stats,
    raw_fields: fields,
    confidence
  };
}

/**
 * Decode equipment type 'e'
 */
function decodeEquipmentE(data: Uint8Array, serial: string): DecodedItem {
  const fields = extractFields(data);
  const stats: ItemStats = {};

  if ('val16_at_2' in fields) {
    stats.primary_stat = fields['val16_at_2'] as number;
  }

  if ('val16_at_8' in fields) {
    stats.secondary_stat = fields['val16_at_8'] as number;
  }

  if ('val16_at_10' in fields && data.length > 38) {
    stats.level = fields['val16_at_10'] as number;
  }

  if ('byte_1' in fields) {
    stats.manufacturer = fields['byte_1'] as number;
  }

  if ('byte_3' in fields) {
    stats.item_class = fields['byte_3'] as number;
  }

  if ('byte_9' in fields) {
    stats.rarity = fields['byte_9'] as number;
  }

  const confidence = ('byte_1' in fields && fields['byte_1'] === 49) ? 'high' : 'medium';

  return {
    serial,
    item_type: 'e',
    item_category: 'equipment',
    length: data.length,
    stats,
    raw_fields: fields,
    confidence
  };
}

/**
 * Decode equipment type 'd'
 */
function decodeEquipmentD(data: Uint8Array, serial: string): DecodedItem {
  const fields = extractFields(data);
  const stats: ItemStats = {};

  if ('val16_at_4' in fields) {
    stats.primary_stat = fields['val16_at_4'] as number;
  }

  if ('val16_at_8' in fields) {
    stats.secondary_stat = fields['val16_at_8'] as number;
  }

  if ('val16_at_10' in fields) {
    stats.level = fields['val16_at_10'] as number;
  }

  if ('byte_5' in fields) {
    stats.manufacturer = fields['byte_5'] as number;
  }

  if ('byte_6' in fields) {
    stats.item_class = fields['byte_6'] as number;
  }

  if ('byte_14' in fields) {
    stats.rarity = fields['byte_14'] as number;
  }

  const confidence = ('byte_5' in fields && fields['byte_5'] === 15) ? 'high' : 'medium';

  return {
    serial,
    item_type: 'd',
    item_category: 'equipment_alt',
    length: data.length,
    stats,
    raw_fields: fields,
    confidence
  };
}

/**
 * Decode other item types
 */
function decodeOtherType(data: Uint8Array, serial: string, itemType: string): DecodedItem {
  const fields = extractFields(data);
  const stats: ItemStats = {};

  const potentialStats = fields['potential_stats'] as [number, number][] | undefined;
  if (potentialStats && potentialStats.length > 0) {
    stats.primary_stat = potentialStats[0][1];
    if (potentialStats.length > 1) {
      stats.secondary_stat = potentialStats[1][1];
    }
  }

  if ('byte_1' in fields) {
    stats.manufacturer = fields['byte_1'] as number;
  }

  if ('byte_2' in fields) {
    stats.rarity = fields['byte_2'] as number;
  }

  const categoryMap: Record<string, string> = {
    'w': 'weapon_special',
    'u': 'utility',
    'f': 'consumable',
    '!': 'special'
  };

  return {
    serial,
    item_type: itemType,
    item_category: categoryMap[itemType] || 'unknown',
    length: data.length,
    stats,
    raw_fields: fields,
    confidence: 'low'
  };
}

/**
 * Decode an item serial string
 */
export function decodeItemSerial(serial: string): DecodedItem {
  try {
    const data = bitPackDecode(serial);

    let itemType = '?';
    if (serial.length >= 4 && serial.startsWith('@Ug')) {
      itemType = serial[3];
    }

    switch (itemType) {
      case 'r':
        return decodeWeapon(data, serial);
      case 'e':
        return decodeEquipmentE(data, serial);
      case 'd':
        return decodeEquipmentD(data, serial);
      default:
        return decodeOtherType(data, serial, itemType);
    }
  } catch (e) {
    return {
      serial,
      item_type: 'error',
      item_category: 'decode_failed',
      length: 0,
      stats: {},
      raw_fields: { error: String(e) },
      confidence: 'none'
    };
  }
}

/**
 * Encode a modified DecodedItem back to serial string
 */
export function encodeItemSerial(decodedItem: DecodedItem): string {
  try {
    const originalData = bitPackDecode(decodedItem.serial);
    const data = new Uint8Array(originalData);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    // Encode based on item type
    if (decodedItem.item_type === 'r') {
      if (decodedItem.stats.primary_stat !== undefined && data.length >= 2) {
        view.setUint16(0, decodedItem.stats.primary_stat, true);
      }
      if (decodedItem.stats.secondary_stat !== undefined && data.length >= 14) {
        view.setUint16(12, decodedItem.stats.secondary_stat, true);
      }
      // Skip rarity write - it's the high byte of primary_stat and gets overwritten
      // if (decodedItem.stats.rarity !== undefined && data.length >= 2) {
      //   data[1] = decodedItem.stats.rarity;
      // }
      if (decodedItem.stats.manufacturer !== undefined && data.length >= 5) {
        data[4] = decodedItem.stats.manufacturer;
      }
      if (decodedItem.stats.item_class !== undefined && data.length >= 9) {
        data[8] = decodedItem.stats.item_class;
      }
    } else if (decodedItem.item_type === 'e') {
      if (decodedItem.stats.primary_stat !== undefined && data.length >= 4) {
        view.setUint16(2, decodedItem.stats.primary_stat, true);
      }
      if (decodedItem.stats.secondary_stat !== undefined && data.length >= 10) {
        view.setUint16(8, decodedItem.stats.secondary_stat, true);
      }
      if (decodedItem.stats.manufacturer !== undefined && data.length >= 2) {
        data[1] = decodedItem.stats.manufacturer;
      }
      // Skip item_class write - it's the high byte of primary_stat (byte 3)
      // if (decodedItem.stats.item_class !== undefined && data.length >= 4) {
      //   data[3] = decodedItem.stats.item_class;
      // }
      // Skip rarity write - it's the high byte of secondary_stat (byte 9)
      // if (decodedItem.stats.rarity !== undefined && data.length >= 10) {
      //   data[9] = decodedItem.stats.rarity;
      // }
    } else if (decodedItem.item_type === 'd') {
      if (decodedItem.stats.primary_stat !== undefined && data.length >= 6) {
        view.setUint16(4, decodedItem.stats.primary_stat, true);
      }
      if (decodedItem.stats.secondary_stat !== undefined && data.length >= 10) {
        view.setUint16(8, decodedItem.stats.secondary_stat, true);
      }
      if (decodedItem.stats.manufacturer !== undefined && data.length >= 6) {
        data[5] = decodedItem.stats.manufacturer;
      }
      if (decodedItem.stats.item_class !== undefined && data.length >= 7) {
        data[6] = decodedItem.stats.item_class;
      }
    }

    // Use '@Ug' prefix - the type character is already part of the encoded data
    const prefix = '@Ug';
    return bitPackEncode(data, prefix);
  } catch (e) {
    console.warn('Failed to encode item serial:', e);
    return decodedItem.serial;
  }
}
