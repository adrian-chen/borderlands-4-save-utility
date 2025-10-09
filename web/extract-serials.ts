import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { decryptSavToYaml } from './src/lib/crypto';
import { parseYaml, findAndDecodeSerials } from './src/lib/yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ACTUAL_STEAM_ID = '76561198081794094';
const savPath = join(__dirname, 'tests/fixtures/1.sav');

const savData = new Uint8Array(readFileSync(savPath));
const yamlBytes = decryptSavToYaml(savData, ACTUAL_STEAM_ID);
const yamlString = new TextDecoder().decode(yamlBytes);
const yamlData = parseYaml(yamlString);

// Find all serials
const allSerials: string[] = [];

function findSerials(obj: any, path: string = ''): void {
  if (typeof obj === 'string' && obj.startsWith('@Ug')) {
    console.log(`Found serial at ${path}: ${obj.substring(0, 30)}...`);
    allSerials.push(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => findSerials(item, `${path}[${i}]`));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      findSerials(value, path ? `${path}.${key}` : key);
    }
  }
}

findSerials(yamlData);

console.log(`\nFound ${allSerials.length} total serials`);

// Show first few unique ones
const uniqueSerials = [...new Set(allSerials)];
console.log(`\nFirst 10 unique serials:`);
uniqueSerials.slice(0, 10).forEach((serial, i) => {
  console.log(`${i + 1}. ${serial}`);
});
