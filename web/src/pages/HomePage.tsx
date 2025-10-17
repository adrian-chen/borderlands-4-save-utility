import { useState } from 'react';
import '../App.css';
import './GuidePage.css';
import { decryptSavToYaml } from '../lib/crypto';
import { decodeItemSerial, encodeItemSerial } from '../lib/items';
import type { DecodedItem } from '../lib/types';
import YamlViewer from '../components/YamlViewer';
import HowItWorksContent from './HowItWorksContent';
import SteamIdGuideContent from './SteamIdGuideContent';
import SaveFileGuideContent from './SaveFileGuideContent';

type Tab = 'upload' | 'modify';
type View = 'editor' | 'howItWorks' | 'steamId' | 'saveLocation';

function HomePage() {
  const [activeView, setActiveView] = useState<View>('editor');
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [steamId, setSteamId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [decryptedYaml, setDecryptedYaml] = useState<string>('');
  const [yamlFilename, setYamlFilename] = useState<string>('untitled.yaml');

  // Item serial modification state
  const [itemSerial, setItemSerial] = useState('');
  const [decodedItem, setDecodedItem] = useState<DecodedItem | null>(null);
  const [editedStats, setEditedStats] = useState<Record<string, number>>({});
  const [modifiedSerial, setModifiedSerial] = useState('');

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

  const handleSerialInput = (serial: string) => {
    setItemSerial(serial);
    setError(null);

    if (serial.trim() && serial.startsWith('@Ug')) {
      const decoded = decodeItemSerial(serial.trim());
      setDecodedItem(decoded);
      // Filter out flags array, only keep number values
      const numericStats: Record<string, number> = {};
      for (const [key, value] of Object.entries(decoded.stats)) {
        if (typeof value === 'number') {
          numericStats[key] = value;
        }
      }
      setEditedStats(numericStats);
      // Set initial modified serial to the same as input serial
      setModifiedSerial(serial.trim());
    } else {
      setDecodedItem(null);
      setEditedStats({});
      setModifiedSerial('');
    }
  };

  const handleStatChange = (statName: string, value: number) => {
    if (!decodedItem) return;

    const newStats = { ...editedStats, [statName]: value };
    setEditedStats(newStats);

    // Create modified decoded item
    const modifiedItem: DecodedItem = {
      ...decodedItem,
      stats: newStats
    };

    // Encode to new serial
    const newSerial = encodeItemSerial(modifiedItem);
    setModifiedSerial(newSerial);
  };

  const handleReplaceSerial = () => {
    if (!itemSerial || !modifiedSerial || itemSerial === modifiedSerial) {
      return;
    }

    // Replace all instances of old serial with new serial in YAML
    const updatedYaml = decryptedYaml.split(itemSerial).join(modifiedSerial);
    setDecryptedYaml(updatedYaml);

    // Update the serial input to the new serial
    setItemSerial(modifiedSerial);
    handleSerialInput(modifiedSerial);
    setSuccess(`Replaced all instances of serial`);
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
      // Read .sav file
      const arrayBuffer = await file.arrayBuffer();
      const savData = new Uint8Array(arrayBuffer);

      // Decrypt to YAML bytes
      const yamlBytes = await decryptSavToYaml(savData, steamId);
      const yamlString = new TextDecoder().decode(yamlBytes);

      // Display YAML in viewer
      const outputFilename = file.name.replace(/\.sav$/i, '.yaml');
      setYamlFilename(outputFilename);
      setDecryptedYaml(yamlString);
      setSuccess('Decrypted successfully');
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
        <h1>Borderlands 4 Save Editor</h1>
        <p>Decrypt and encrypt BL4 save files with item serial manipulation</p>
        <nav className="header-nav">
          {activeView === 'editor' ? (
            <>
              <a onClick={() => setActiveView('howItWorks')} style={{ cursor: 'pointer' }}>How It Works</a>
              <a onClick={() => setActiveView('steamId')} style={{ cursor: 'pointer' }}>How to Find Steam ID</a>
              <a onClick={() => setActiveView('saveLocation')} style={{ cursor: 'pointer' }}>How to Find Save Files</a>
            </>
          ) : (
            <>
              <a onClick={() => setActiveView('editor')} style={{ cursor: 'pointer' }}>Back to Editor</a>
              <a onClick={() => setActiveView('howItWorks')} style={{ cursor: 'pointer' }}>How It Works</a>
              <a onClick={() => setActiveView('steamId')} style={{ cursor: 'pointer' }}>How to Find Steam ID</a>
              <a onClick={() => setActiveView('saveLocation')} style={{ cursor: 'pointer' }}>How to Find Save Files</a>
            </>
          )}
        </nav>
      </header>

      <main>
        {activeView === 'editor' ? (
          <div className="app-container">
            <div className="main-content">
              <div className="content-layout">
                <div className="form-section">
                  <div className="input-group">
                    <label htmlFor="steamId">
                      Steam ID *
                      <a onClick={() => setActiveView('steamId')} className="help-link" style={{ cursor: 'pointer' }}>How do I find this?</a>
                    </label>
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

                  <div className="tab-selector">
                    <button
                      className={activeTab === 'upload' ? 'active' : ''}
                      onClick={() => setActiveTab('upload')}
                    >
                      File Upload
                    </button>
                    <button
                      className={activeTab === 'modify' ? 'active' : ''}
                      onClick={() => setActiveTab('modify')}
                    >
                      Item Modification
                    </button>
                  </div>

                  {activeTab === 'upload' && (
                    <>
                      <div
                        className="file-drop-zone"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <input
                          type="file"
                          id="fileInput"
                          onChange={handleFileChange}
                          accept=".sav"
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
                              <span>Click or drag to select .sav file</span>
                              <small>
                                <a onClick={() => setActiveView('saveLocation')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                                  Where are my save files?
                                </a>
                              </small>
                            </>
                          )}
                        </label>
                      </div>

                      <button
                        className="process-button"
                        onClick={processFile}
                        disabled={processing || !file || !steamId}
                      >
                        {processing ? 'Processing...' : 'Decrypt'}
                      </button>
                    </>
                  )}

                  {activeTab === 'modify' && (
                    <>
                      <div className="input-group">
                        <label htmlFor="itemSerial">Item Serial</label>
                        <input
                          id="itemSerial"
                          type="text"
                          value={itemSerial}
                          onChange={(e) => handleSerialInput(e.target.value)}
                          placeholder="@UgrXXXXXXXXXXXXXXXXXX..."
                          className="serial-input"
                        />
                        <small>Paste item serial starting with @Ug</small>
                      </div>

                      {decodedItem && (
                        <div className="decoded-stats">
                          <div className="stats-header">
                            <strong>Decoded Stats</strong>
                            <span className={`confidence-badge ${decodedItem.confidence}`}>
                              {decodedItem.confidence} confidence
                            </span>
                          </div>

                          <div className="stat-fields">
                            {decodedItem.stats.primary_stat !== undefined && (
                              <div className="stat-field">
                                <label>Primary Stat (Damage)</label>
                                <input
                                  type="number"
                                  value={editedStats.primary_stat ?? 0}
                                  onChange={(e) => handleStatChange('primary_stat', parseInt(e.target.value))}
                                />
                              </div>
                            )}

                            {decodedItem.stats.secondary_stat !== undefined && (
                              <div className="stat-field">
                                <label>Secondary Stat</label>
                                <input
                                  type="number"
                                  value={editedStats.secondary_stat ?? 0}
                                  onChange={(e) => handleStatChange('secondary_stat', parseInt(e.target.value))}
                                />
                              </div>
                            )}

                            {decodedItem.stats.manufacturer !== undefined && (
                              <div className="stat-field">
                                <label>Manufacturer</label>
                                <input
                                  type="number"
                                  value={editedStats.manufacturer ?? 0}
                                  onChange={(e) => handleStatChange('manufacturer', parseInt(e.target.value))}
                                />
                              </div>
                            )}

                            {decodedItem.stats.item_class !== undefined && (
                              <div className="stat-field">
                                <label>Item Class</label>
                                <input
                                  type="number"
                                  value={editedStats.item_class ?? 0}
                                  onChange={(e) => handleStatChange('item_class', parseInt(e.target.value))}
                                />
                              </div>
                            )}

                            {decodedItem.stats.rarity !== undefined && (
                              <div className="stat-field">
                                <label>Rarity</label>
                                <input
                                  type="number"
                                  value={editedStats.rarity ?? 0}
                                  onChange={(e) => handleStatChange('rarity', parseInt(e.target.value))}
                                />
                              </div>
                            )}
                          </div>

                          <div className="modified-serial">
                            <strong>Modified Serial:</strong>
                            <code>{modifiedSerial || 'No changes yet'}</code>
                            <button
                              className="replace-button"
                              onClick={handleReplaceSerial}
                              disabled={!modifiedSerial || modifiedSerial === itemSerial}
                            >
                              Replace All Instances
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

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

                <YamlViewer
                  yamlContent={decryptedYaml}
                  filename={yamlFilename}
                  steamId={steamId}
                />
              </div>
            </div>
          </div>
        ) : activeView === 'howItWorks' ? (
          <HowItWorksContent />
        ) : activeView === 'steamId' ? (
          <SteamIdGuideContent />
        ) : (
          <SaveFileGuideContent />
        )}
      </main>

      <footer>
        <p>
          Made with ❤️ for Borderlands 4 | <a href="https://github.com/adrian-chen/borderlands-4-save-utility" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
