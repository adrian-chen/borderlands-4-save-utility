/**
 * Sample item serials for testing
 * These are example serials representing different item types
 */

export const WEAPON_SERIALS = [
  // Type 'r' weapons - replace with real serials when available
  '@UgrAABBCCDDEE',
];

export const EQUIPMENT_E_SERIALS = [
  // Type 'e' equipment - replace with real serials when available
  '@UgeXXYYZZ',
];

export const EQUIPMENT_D_SERIALS = [
  // Type 'd' equipment - replace with real serials when available
  '@UgdMMNNOO',
];

export const OTHER_TYPE_SERIALS = [
  // Other types (w/u/f/!) - replace with real serials when available
  '@UgwAABBCC',
];

/**
 * Known test data for codec round-trip testing
 */
export const CODEC_TEST_DATA = [
  {
    bytes: new Uint8Array([0x00, 0x01, 0x02, 0x03]),
    description: 'Simple 4-byte sequence',
  },
  {
    bytes: new Uint8Array([0xFF, 0xEE, 0xDD, 0xCC, 0xBB, 0xAA]),
    description: '6-byte descending sequence',
  },
  {
    bytes: new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0]),
    description: '8-byte mixed values',
  },
];

/**
 * Test Steam IDs for crypto testing
 */
export const TEST_STEAM_IDS = [
  '76561198000000000', // Valid format, starting with 7656119
  '76561198123456789',
  '76561199999999999',
];

/**
 * IMPORTANT: Set this to your actual Steam ID for the .sav files in fixtures/
 * This is required for decryption tests to pass.
 * Your Steam ID is a 17-digit number starting with 7656119...
 */
export const ACTUAL_STEAM_ID = process.env.STEAM_ID || '76561198081794094';
