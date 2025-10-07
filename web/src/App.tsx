import { useState } from 'react';
import './App.css';
import { decryptSavToYaml, encryptYamlToSav } from './lib/crypto';
import { findAndDecodeSerials, insertDecodedItems, extractAndEncodeSerials, parseYaml, stringifyYaml } from './lib/yaml';
import AdSidebar from './components/AdSidebar';

type Mode = 'decrypt' | 'encrypt';

function App() {
  const [mode, setMode] = useState<Mode>('decrypt');
  const [steamId, setSteamId] = useState('');
  const [decodeSerials, setDecodeSerials] = useState(false);
  const [encodeSerials, setEncodeSerials] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const downloadFile = (data: Uint8Array | string, filename: string) => {
    const blob = typeof data === 'string'
      ? new Blob([data], { type: 'text/yaml' })
      : new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!steamId || !/^7656119\d{10}$/.test(steamId)) {
      setError('Please enter a valid Steam ID (17 digits, starts with 7656119)');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'decrypt') {
        // Read .sav file
        const arrayBuffer = await file.arrayBuffer();
        const savData = new Uint8Array(arrayBuffer);

        // Decrypt to YAML bytes
        const yamlBytes = await decryptSavToYaml(savData, steamId);
        const yamlString = new TextDecoder().decode(yamlBytes);

        let outputYaml = yamlString;

        if (decodeSerials) {
          // Parse YAML and decode item serials
          const yamlData = parseYaml(yamlString);
          const decodedSerials = findAndDecodeSerials(yamlData);

          if (Object.keys(decodedSerials).length > 0) {
            const yamlWithDecoded = insertDecodedItems(yamlData, decodedSerials);
            outputYaml = stringifyYaml(yamlWithDecoded);
            setSuccess(`Decrypted with ${Object.keys(decodedSerials).length} decoded item serials`);
          } else {
            outputYaml = stringifyYaml(yamlData);
            setSuccess('Decrypted (no item serials found to decode)');
          }
        } else {
          setSuccess('Decrypted successfully');
        }

        // Download YAML file
        const outputFilename = file.name.replace(/\.sav$/i, '.yaml');
        downloadFile(outputYaml, outputFilename);

      } else {
        // Encrypt mode
        const yamlString = await file.text();
        let finalYaml = yamlString;

        if (encodeSerials) {
          // Parse and encode item serials
          const yamlData = parseYaml(yamlString);

          if ('_DECODED_ITEMS' in yamlData) {
            const yamlWithEncoded = extractAndEncodeSerials(yamlData);
            finalYaml = stringifyYaml(yamlWithEncoded);
            setSuccess('Encrypted with re-encoded item serials');
          } else {
            setSuccess('Encrypted (no _DECODED_ITEMS section found)');
          }
        } else {
          setSuccess('Encrypted successfully');
        }

        // Encrypt to .sav
        const yamlBytes = new TextEncoder().encode(finalYaml);
        const savData = await encryptYamlToSav(yamlBytes, steamId);

        // Download .sav file
        const outputFilename = file.name.replace(/\.yaml$/i, '.sav');
        downloadFile(savData, outputFilename);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('PKCS7') || err.message.includes('padding')) {
          setError('Decryption failed: Wrong Steam ID or corrupted file');
        } else if (err.message.includes('inflate') || err.message.includes('zlib')) {
          setError('Decompression failed: Wrong Steam ID or corrupted file');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Borderlands 4 Save Utility</h1>
        <p>Decrypt and encrypt BL4 save files with item serial manipulation</p>
      </header>

      <main>
        <div className="app-container">
          <AdSidebar position="left" />

          <div className="main-content">
            <div className="mode-selector">
          <button
            className={mode === 'decrypt' ? 'active' : ''}
            onClick={() => setMode('decrypt')}
          >
            Decrypt (.sav → .yaml)
          </button>
          <button
            className={mode === 'encrypt' ? 'active' : ''}
            onClick={() => setMode('encrypt')}
          >
            Encrypt (.yaml → .sav)
          </button>
        </div>

        <div className="form-section">
          <div className="input-group">
            <label htmlFor="steamId">Steam ID *</label>
            <input
              id="steamId"
              type="text"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              placeholder="7656119XXXXXXXXXX"
              className="steam-id-input"
            />
            <small>17-digit Steam ID starting with 7656119</small>
          </div>

          {mode === 'decrypt' && (
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={decodeSerials}
                  onChange={(e) => setDecodeSerials(e.target.checked)}
                />
                Decode item serials (adds _DECODED_ITEMS section for editing stats)
              </label>
            </div>
          )}

          {mode === 'encrypt' && (
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={encodeSerials}
                  onChange={(e) => setEncodeSerials(e.target.checked)}
                />
                Encode item serials (apply changes from _DECODED_ITEMS section)
              </label>
            </div>
          )}

          <div
            className="file-drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept={mode === 'decrypt' ? '.sav' : '.yaml,.yml'}
              style={{ display: 'none' }}
            />
            <label htmlFor="fileInput" className="file-drop-label">
              {file ? (
                <>
                  <span className="file-icon">📄</span>
                  <span>{file.name}</span>
                  <small>Click or drag to change</small>
                </>
              ) : (
                <>
                  <span className="file-icon">📁</span>
                  <span>Click or drag to select {mode === 'decrypt' ? '.sav' : '.yaml'} file</span>
                </>
              )}
            </label>
          </div>

          <button
            className="process-button"
            onClick={processFile}
            disabled={processing || !file || !steamId}
          >
            {processing ? 'Processing...' : mode === 'decrypt' ? 'Decrypt' : 'Encrypt'}
          </button>

          {error && (
            <div className="message error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="message success">
              <strong>Success:</strong> {success}
            </div>
          )}
        </div>

        <div className="info-section">
          <h2>Instructions</h2>

          {mode === 'decrypt' ? (
            <>
              <h3>Basic Decryption</h3>
              <ol>
                <li>Enter your Steam ID (17 digits)</li>
                <li>Select your .sav file (1.sav, 2.sav, etc.)</li>
                <li>Click "Decrypt" to download the YAML file</li>
                <li>Edit the YAML in any text editor</li>
              </ol>

              <h3>Item Serial Decoding (Experimental)</h3>
              <ol>
                <li>Check "Decode item serials" option</li>
                <li>The output YAML will include a _DECODED_ITEMS section</li>
                <li>Edit stats like primary_stat (damage), rarity, manufacturer, etc.</li>
                <li>Re-encrypt with "Encode item serials" option</li>
              </ol>

              <p><strong>Note:</strong> High confidence items are most reliable for editing.</p>
            </>
          ) : (
            <>
              <h3>Basic Encryption</h3>
              <ol>
                <li>Enter your Steam ID (must match original save owner)</li>
                <li>Select your edited .yaml file</li>
                <li>Click "Encrypt" to download the .sav file</li>
                <li>Replace your original save file</li>
              </ol>

              <h3>Item Serial Encoding</h3>
              <ol>
                <li>Check "Encode item serials" if you edited _DECODED_ITEMS</li>
                <li>Your stat changes will be applied to the item serials</li>
                <li>The _DECODED_ITEMS section will be removed automatically</li>
              </ol>
            </>
          )}

          <h3>Important Notes</h3>
          <ul>
            <li><strong>Backup your saves!</strong> This tool modifies save files.</li>
            <li>Only Steam saves are currently supported</li>
            <li>Steam ID must match the original save file owner</li>
            <li>Edit numbered saves (1.sav, 2.sav) for game progress</li>
            <li>Edit Profile.sav for cosmetics</li>
          </ul>
        </div>
          </div>

          <AdSidebar position="right" />
        </div>
      </main>

      <footer>
        <p>
          Made with ❤️ for Borderlands 4 | <a href="https://github.com/adrian-chen/borderlands-4-save-utility" target="_blank">GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
