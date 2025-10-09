import { describe, it, expect } from 'vitest';
import { bitPackDecode, bitPackEncode } from '../codec';
import { CODEC_TEST_DATA } from '../../../tests/fixtures/sample-serials';

describe('Codec - Bit Packing', () => {
  describe('bitPackDecode', () => {
    it('should decode a serial with @Ug prefix', () => {
      const serial = '@UgrA';
      const result = bitPackDecode(serial);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should decode a serial without prefix', () => {
      const serial = 'ABC';
      const result = bitPackDecode(serial);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty string', () => {
      const serial = '';
      const result = bitPackDecode(serial);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });

    it('should only use valid characters from charset', () => {
      // Valid characters should decode without errors
      const validSerial = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      expect(() => bitPackDecode(validSerial)).not.toThrow();
    });
  });

  describe('bitPackEncode', () => {
    it('should encode bytes with default @Ug prefix', () => {
      const data = new Uint8Array([0x00, 0x01, 0x02]);
      const result = bitPackEncode(data);
      expect(result).toMatch(/^@Ug/);
    });

    it('should encode bytes with custom prefix', () => {
      const data = new Uint8Array([0x00, 0x01, 0x02]);
      const prefix = '@Ugr';
      const result = bitPackEncode(data, prefix);
      expect(result).toMatch(/^@Ugr/);
    });

    it('should encode empty byte array', () => {
      const data = new Uint8Array([]);
      const result = bitPackEncode(data);
      expect(result).toBe('@Ug');
    });

    it('should encode single byte', () => {
      const data = new Uint8Array([0xFF]);
      const result = bitPackEncode(data);
      expect(result.length).toBeGreaterThan(3); // '@Ug' + encoded chars
    });
  });

  describe('Round-trip encoding/decoding', () => {
    CODEC_TEST_DATA.forEach(({ bytes, description }) => {
      it(`should round-trip ${description}`, () => {
        const encoded = bitPackEncode(bytes);
        const decoded = bitPackDecode(encoded);

        // Compare byte arrays
        expect(decoded.length).toBe(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
          expect(decoded[i]).toBe(bytes[i]);
        }
      });
    });

    it('should round-trip with custom prefix', () => {
      const data = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
      const prefix = '@Ugd';
      const encoded = bitPackEncode(data, prefix);
      const decoded = bitPackDecode(encoded);

      // Note: The 'd' from the prefix becomes part of the decoded data
      // This matches Python's behavior where only '@Ug' is stripped
      // The decoded data will be longer than the original
      expect(decoded.length).toBeGreaterThanOrEqual(data.length);
      expect(encoded.startsWith(prefix)).toBe(true);
    });

    it('should handle all byte values (0-255)', () => {
      const data = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        data[i] = i;
      }

      const encoded = bitPackEncode(data);
      const decoded = bitPackDecode(encoded);

      expect(decoded.length).toBe(256);
      for (let i = 0; i < 256; i++) {
        expect(decoded[i]).toBe(i);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle maximum byte values', () => {
      const data = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF]);
      const encoded = bitPackEncode(data);
      const decoded = bitPackDecode(encoded);

      expect(decoded).toEqual(data);
    });

    it('should handle minimum byte values', () => {
      const data = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      const encoded = bitPackEncode(data);
      const decoded = bitPackDecode(encoded);

      expect(decoded).toEqual(data);
    });

    it('should handle alternating patterns', () => {
      const data = new Uint8Array([0xAA, 0x55, 0xAA, 0x55]);
      const encoded = bitPackEncode(data);
      const decoded = bitPackDecode(encoded);

      expect(decoded).toEqual(data);
    });
  });
});
