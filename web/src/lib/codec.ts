/**
 * Bit-packing codec for Borderlands 4 item serials
 */

const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=!$%&*()[]{}~`^_<>?#;';

/**
 * Decode a bit-packed item serial to byte array
 */
export function bitPackDecode(serial: string): Uint8Array {
  let payload: string;

  if (serial.startsWith('@Ug')) {
    payload = serial.slice(3);
  } else {
    payload = serial;
  }

  // Build character map
  const charMap = new Map<string, number>();
  for (let i = 0; i < CHAR_SET.length; i++) {
    charMap.set(CHAR_SET[i], i);
  }

  // Convert characters to 6-bit values and build bit string
  let bitString = '';
  for (const char of payload) {
    if (charMap.has(char)) {
      const val = charMap.get(char)!;
      bitString += val.toString(2).padStart(6, '0');
    }
  }

  // Pad to multiple of 8
  while (bitString.length % 8 !== 0) {
    bitString += '0';
  }

  // Convert bit string to bytes
  const byteData: number[] = [];
  for (let i = 0; i < bitString.length; i += 8) {
    const byte = parseInt(bitString.slice(i, i + 8), 2);
    byteData.push(byte);
  }

  return new Uint8Array(byteData);
}

/**
 * Encode byte array to bit-packed serial string
 */
export function bitPackEncode(data: Uint8Array, prefix: string = '@Ug'): string {
  // Convert bytes to bit string
  let bitString = '';
  for (const byte of data) {
    bitString += byte.toString(2).padStart(8, '0');
  }

  // Pad to multiple of 6
  while (bitString.length % 6 !== 0) {
    bitString += '0';
  }

  // Convert 6-bit chunks to characters
  const result: string[] = [];
  for (let i = 0; i < bitString.length; i += 6) {
    const chunk = bitString.slice(i, i + 6);
    const val = parseInt(chunk, 2);
    if (val < CHAR_SET.length) {
      result.push(CHAR_SET[val]);
    }
  }

  return prefix + result.join('');
}
