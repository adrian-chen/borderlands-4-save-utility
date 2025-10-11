# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Borderlands 4 save file encryption/decryption utility. It decrypts `.sav` files to editable YAML format and encrypts them back for use in-game. The tool includes advanced item serial manipulation capabilities for modifying weapon and equipment stats.

**Key constraint**: Only Steam saves are currently supported. The Steam ID is required for all operations as it's used to derive the encryption key.

## Development Commands

### Setup

```bash
pip install -r requirements.txt
```

Dependencies: `pycryptodome>=3.15.0`, `pyyaml>=6.0`

### Basic Usage

```bash
# Decrypt save to YAML
python blcrypt.py decrypt -in 1.sav -out save.yaml -id <STEAM_ID>

# Encrypt YAML to save
python blcrypt.py encrypt -in save.yaml -out 1.sav -id <STEAM_ID>

# Decrypt with item serial decoding (adds _DECODED_ITEMS section)
python blcrypt.py decrypt -in 1.sav -out save.yaml -id <STEAM_ID> --decode-serials

# Encrypt with item serial encoding (applies _DECODED_ITEMS changes)
python blcrypt.py encrypt -in save.yaml -out 1.sav -id <STEAM_ID> --encode-serials

# View help
python blcrypt.py decrypt --help
python blcrypt.py encrypt --help
```

Steam ID format: 17-digit number starting with `7656119...`

## Code Architecture

### Encryption Layer (blcrypt.py:453-486)

- **Key Derivation**: `derive_key()` XORs a hardcoded `BASE_KEY` with the user's Steam ID (converted to little-endian 8 bytes) to create a unique 32-byte AES key
- **Encryption**: AES-ECB mode with PKCS7 padding
- **Compression**: zlib compression with adler32 checksum and uncompressed length appended
- **Flow**: Save file ↔ AES decrypt/encrypt ↔ zlib decompress/compress ↔ YAML

### Item Serial Codec (blcrypt.py:51-94)

Item serials use a custom bit-packing encoding:
- **Format**: `@Ug{type}{encoded_data}` where type is a single character (r=weapon, e=equipment, d=equipment_alt, etc.)
- **Encoding**: Base-78 character set (A-Z, a-z, 0-9, plus special chars) maps to 6-bit values
- **Decoding**: 6-bit chunks → binary → byte array containing item stats
- Functions: `bit_pack_decode()` and `bit_pack_encode()`

### Item Stat Decoders (blcrypt.py:129-261)

Type-specific decoders extract stats from decoded byte arrays:

- **Weapons** (`decode_weapon`, type='r'): High confidence. Extracts damage (primary_stat at offset 0), secondary_stat, manufacturer, item_class, rarity
- **Equipment** (`decode_equipment_e`, type='e'): High/medium confidence. Different byte offsets than weapons
- **Equipment Alt** (`decode_equipment_d`, type='d'): High/medium confidence. Another equipment variant with different structure
- **Other types** (`decode_other_type`, types='w'/'u'/'f'/'!'): Low confidence generic decoding

Each decoder returns a `DecodedItem` with confidence level (high/medium/low/none) indicating reliability for editing.

### YAML Transformation Pipeline (blcrypt.py:338-451)

**Decode workflow** (`--decode-serials`):
1. `find_and_decode_serials_in_yaml()`: Recursively searches YAML for `@Ug` prefixed strings, decodes each
2. `insert_decoded_items_in_yaml()`: Adds `_DECODED_ITEMS` section with human-editable stats

**Encode workflow** (`--encode-serials`):
1. `extract_and_encode_serials_from_yaml()`: Reads `_DECODED_ITEMS`, creates `DecodedItem` objects
2. `encode_item_serial()`: Modifies original byte array at known offsets based on item type
3. `set_nested_value()`: Updates YAML paths like `inventory.items[0].serial` with re-encoded serials
4. Removes `_DECODED_ITEMS` section before final encryption

### Data Structures (blcrypt.py:31-49)

- **ItemStats**: Holds primary_stat, secondary_stat, level, rarity, manufacturer, item_class, flags
- **DecodedItem**: Complete decoded item with stats, raw_fields, confidence level, metadata

## Important Technical Notes

- **YAML Constructor**: Custom `unknown_constructor` allows loading YAML with unknown tags (game-specific serialization)
- **Byte Offsets**: Each item type has hardcoded offsets for stats. Changing item types requires understanding the byte structure
- **Confidence Levels**: Only "high" confidence items are recommended for stat editing. Lower confidence may cause game issues
- **Error Handling**: PKCS7 padding errors or zlib decompression failures indicate incorrect Steam ID
- **File Types**: Numbered saves (1.sav, 2.sav) contain full game progress. Profile.sav contains cosmetics
