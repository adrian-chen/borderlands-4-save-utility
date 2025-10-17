import { describe, it, expect } from 'vitest';
import { decryptSavToYaml } from '../src/lib/crypto';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { ACTUAL_STEAM_ID } from './fixtures/sample-serials';

/**
 * TEMPORARY VALIDATION TEST
 *
 * This test validates that our TypeScript implementation produces
 * identical output to the Python implementation.
 *
 * Once we're confident everything works, this test will be removed
 * along with the Python code.
 */

describe('Validation - TypeScript vs Python Output', () => {
  const FIXTURES_DIR = join(__dirname, 'fixtures');
  const PYTHON_SCRIPT = join(__dirname, '../../blcrypt.py');

  it('should produce identical output to Python for 1.sav', () => {
    const savPath = join(FIXTURES_DIR, '1.sav');
    const pythonOutputPath = '/tmp/python-1.yaml';

    // Decrypt with Python
    try {
      execSync(
        `python3 ${PYTHON_SCRIPT} decrypt -in ${savPath} -out ${pythonOutputPath} -id ${ACTUAL_STEAM_ID}`,
        { stdio: 'pipe' }
      );
    } catch (error: any) {
      throw new Error(`Python decryption failed: ${error.message}`);
    }

    const pythonOutput = readFileSync(pythonOutputPath);

    // Decrypt with TypeScript
    const savData = new Uint8Array(readFileSync(savPath));
    console.log('savData length:', savData.length);

    const tsOutput = decryptSavToYaml(savData, ACTUAL_STEAM_ID);

    console.log('tsOutput type:', typeof tsOutput);
    console.log('tsOutput:', tsOutput ? `length=${tsOutput.length}` : 'undefined');

    if (!tsOutput) {
      throw new Error('decryptSavToYaml returned undefined!');
    }

    // Compare byte-by-byte
    expect(tsOutput.length).toBe(pythonOutput.length);

    // If lengths match, compare contents
    for (let i = 0; i < tsOutput.length; i++) {
      if (tsOutput[i] !== pythonOutput[i]) {
        // Show context around mismatch
        const start = Math.max(0, i - 20);
        const end = Math.min(tsOutput.length, i + 20);
        const tsContext = Array.from(tsOutput.slice(start, end)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const pyContext = Array.from(pythonOutput.slice(start, end)).map(b => b.toString(16).padStart(2, '0')).join(' ');

        throw new Error(
          `Mismatch at byte ${i}:\n` +
          `TypeScript: ${tsContext}\n` +
          `Python:     ${pyContext}`
        );
      }
    }

    // Clean up
    try {
      unlinkSync(pythonOutputPath);
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should produce identical output to Python for 3.sav', () => {
    const savPath = join(FIXTURES_DIR, '3.sav');
    const pythonOutputPath = '/tmp/python-3.yaml';

    // Decrypt with Python
    try {
      execSync(
        `python3 ${PYTHON_SCRIPT} decrypt -in ${savPath} -out ${pythonOutputPath} -id ${ACTUAL_STEAM_ID}`,
        { stdio: 'pipe' }
      );
    } catch (error: any) {
      throw new Error(`Python decryption failed: ${error.message}`);
    }

    const pythonOutput = readFileSync(pythonOutputPath);

    // Decrypt with TypeScript
    const savData = new Uint8Array(readFileSync(savPath));
    console.log('savData length:', savData.length);

    const tsOutput = decryptSavToYaml(savData, ACTUAL_STEAM_ID);

    console.log('tsOutput type:', typeof tsOutput);
    console.log('tsOutput:', tsOutput ? `length=${tsOutput.length}` : 'undefined');

    if (!tsOutput) {
      throw new Error('decryptSavToYaml returned undefined!');
    }

    // Compare byte-by-byte
    expect(tsOutput.length).toBe(pythonOutput.length);

    for (let i = 0; i < tsOutput.length; i++) {
      if (tsOutput[i] !== pythonOutput[i]) {
        const start = Math.max(0, i - 20);
        const end = Math.min(tsOutput.length, i + 20);
        const tsContext = Array.from(tsOutput.slice(start, end)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const pyContext = Array.from(pythonOutput.slice(start, end)).map(b => b.toString(16).padStart(2, '0')).join(' ');

        throw new Error(
          `Mismatch at byte ${i}:\n` +
          `TypeScript: ${tsContext}\n` +
          `Python:     ${pyContext}`
        );
      }
    }

    // Clean up
    try {
      unlinkSync(pythonOutputPath);
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should produce identical output to Python for 5.sav (brand new character)', () => {
    const savPath = join(FIXTURES_DIR, '5.sav');
    const pythonOutputPath = '/tmp/python-5.yaml';

    // Decrypt with Python
    try {
      execSync(
        `python3 ${PYTHON_SCRIPT} decrypt -in ${savPath} -out ${pythonOutputPath} -id ${ACTUAL_STEAM_ID}`,
        { stdio: 'pipe' }
      );
    } catch (error: any) {
      throw new Error(`Python decryption failed: ${error.message}`);
    }

    const pythonOutput = readFileSync(pythonOutputPath);

    // Decrypt with TypeScript
    const savData = new Uint8Array(readFileSync(savPath));
    console.log('savData length:', savData.length);

    const tsOutput = decryptSavToYaml(savData, ACTUAL_STEAM_ID);

    console.log('tsOutput type:', typeof tsOutput);
    console.log('tsOutput:', tsOutput ? `length=${tsOutput.length}` : 'undefined');

    if (!tsOutput) {
      throw new Error('decryptSavToYaml returned undefined!');
    }

    // Compare byte-by-byte
    expect(tsOutput.length).toBe(pythonOutput.length);

    for (let i = 0; i < tsOutput.length; i++) {
      if (tsOutput[i] !== pythonOutput[i]) {
        const start = Math.max(0, i - 20);
        const end = Math.min(tsOutput.length, i + 20);
        const tsContext = Array.from(tsOutput.slice(start, end)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const pyContext = Array.from(pythonOutput.slice(start, end)).map(b => b.toString(16).padStart(2, '0')).join(' ');

        throw new Error(
          `Mismatch at byte ${i}:\n` +
          `TypeScript: ${tsContext}\n` +
          `Python:     ${pyContext}`
        );
      }
    }

    // Clean up
    try {
      unlinkSync(pythonOutputPath);
    } catch {
      // Ignore cleanup errors
    }
  });
});
