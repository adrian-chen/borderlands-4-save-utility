/**
 * Sample item serials for testing - extracted from real save files
 */

// Type 'r' weapons - Real serials from 1.sav
export const WEAPON_SERIALS = [
  // High confidence weapon (length 24), primary_stat: 5294, secondary_stat: 10074
  '@Ugr$lGm/&<N!od8XM-}RPG}pu$8r1oA0ss',
  // Medium confidence weapon (length 25), primary_stat: 5550, secondary_stat: 40842
  '@Ugr$rIm/$oi!u0*1N4;++Xi)E?(IL^rD*y',
  // Medium confidence weapon (length 25), primary_stat: 5550, secondary_stat: 40842
  '@Ugr$rIm/$uk!e}/5N4;++=uq#Yp(1<5CIA',
];

// Type 'e' equipment - Real serials from 1.sav
export const EQUIPMENT_E_SERIALS = [
  // Medium confidence (length 25), primary_stat: 59025, secondary_stat: 936
  '@Uge8;)m/$ig!qAMMM!jz*=uq#Y*(G{~DgX',
  // Medium confidence (length 22), primary_stat: 19880, secondary_stat: 55933
  '@Uge92<m/%J!!fd;sMm?&1G&jVD^bkk@',
  // Medium confidence (length 25), primary_stat: 39787, secondary_stat: 51796
  '@Uge8Rrm/%V&!q~r{L_O+!G}=U(U=mwG1po',
];

// Type 'd' equipment - Will be added when found
export const EQUIPMENT_D_SERIALS = [
  // Placeholder - update when real serial found
  '@UgdMMNNOO',
];

// Other types (w/u/f/!) - Real serials from 1.sav
export const OTHER_TYPE_SERIALS = [
  // Type 'u' utility (low confidence, length 32)
  '@Uguq~c2?h%y%%%t`i7M2hh71iVEUG8!Cn^l84k{Pw9s&',
  // Type 'w' (varies by implementation)
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
