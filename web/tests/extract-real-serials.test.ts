import { describe, it } from 'vitest';
import { decryptSavToYaml } from '../src/lib/crypto';
import { parseYaml } from '../src/lib/yaml';
import { decodeItemSerial } from '../src/lib/items';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ACTUAL_STEAM_ID } from './fixtures/sample-serials';

/**
 * This test extracts real item serials from save files
 * Run with: npm test extract-real-serials
 */
describe('Extract Real Serials from Save Files', () => {
  it('should extract serials from 1.sav', () => {
    const savPath = join(__dirname, 'fixtures/1.sav');
    const savData = new Uint8Array(readFileSync(savPath));

    const yamlBytes = decryptSavToYaml(savData, ACTUAL_STEAM_ID);
    const yamlString = new TextDecoder().decode(yamlBytes);
    const yamlData = parseYaml(yamlString);

    const serials: { path: string; serial: string; decoded: any }[] = [];

    function findSerials(obj: any, path: string = ''): void {
      if (typeof obj === 'string' && obj.startsWith('@Ug')) {
        try {
          const decoded = decodeItemSerial(obj);
          serials.push({
            path,
            serial: obj,
            decoded: {
              type: decoded.item_type,
              category: decoded.item_category,
              confidence: decoded.confidence,
              length: decoded.length,
              stats: decoded.stats
            }
          });
        } catch (e) {
          // Skip invalid serials
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => findSerials(item, `${path}[${i}]`));
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          findSerials(value, path ? `${path}.${key}` : key);
        }
      }
    }

    findSerials(yamlData);

    console.log(`\n=== Found ${serials.length} serials in 1.sav ===\n`);

    // Group by type
    const byType: Record<string, typeof serials> = {};
    serials.forEach(s => {
      const type = s.decoded.type;
      if (!byType[type]) byType[type] = [];
      byType[type].push(s);
    });

    // Show examples of each type
    for (const [type, items] of Object.entries(byType)) {
      console.log(`\n--- Type '${type}' (${items.length} items) ---`);

      // Show first 3 of each type with high confidence
      const highConfidence = items.filter(i => i.decoded.confidence === 'high');
      const toShow = highConfidence.slice(0, 3);

      toShow.forEach((item, idx) => {
        console.log(`\n${idx + 1}. Serial: ${item.serial}`);
        console.log(`   Path: ${item.path}`);
        console.log(`   Category: ${item.decoded.category}`);
        console.log(`   Confidence: ${item.decoded.confidence}`);
        console.log(`   Length: ${item.decoded.length}`);
        console.log(`   Stats:`, JSON.stringify(item.decoded.stats, null, 2));
      });
    }

    // Write to file for easy reference
    const output = {
      totalSerials: serials.length,
      byType: Object.fromEntries(
        Object.entries(byType).map(([type, items]) => [
          type,
          {
            count: items.length,
            samples: items.slice(0, 5).map(i => ({
              serial: i.serial,
              path: i.path,
              decoded: i.decoded
            }))
          }
        ])
      )
    };

    writeFileSync(
      join(__dirname, 'fixtures/extracted-serials.json'),
      JSON.stringify(output, null, 2)
    );

    console.log(`\n\n✓ Written to tests/fixtures/extracted-serials.json\n`);
  });
});
