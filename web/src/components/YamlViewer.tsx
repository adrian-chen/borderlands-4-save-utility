import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { encryptYamlToSav } from '../lib/crypto';

interface YamlViewerProps {
  yamlContent: string;
  filename: string;
  steamId: string;
}

function YamlViewer({ yamlContent, filename, steamId }: YamlViewerProps) {
  const [editedContent, setEditedContent] = useState(yamlContent);
  const [encrypting, setEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update editor content when yamlContent prop changes (after decryption)
  useEffect(() => {
    setEditedContent(yamlContent);
  }, [yamlContent]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditedContent(value);
      setError(null);
      setSuccess(null);
    }
  };

  const handleEncrypt = async () => {
    if (!steamId || !/^7656119\d{10}$/.test(steamId)) {
      setError('Invalid Steam ID. Please check the Steam ID field above.');
      return;
    }

    setEncrypting(true);
    setError(null);
    setSuccess(null);

    try {
      // Encrypt YAML to .sav
      const yamlBytes = new TextEncoder().encode(editedContent);
      const savData = await encryptYamlToSav(yamlBytes, steamId);

      setSuccess('Encrypted successfully');

      // Download .sav file
      const outputFilename = filename.replace(/\.yaml$/i, '.sav');
      const blob = new Blob([savData.buffer as ArrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('PKCS7') || err.message.includes('padding')) {
          setError('Encryption failed: Wrong Steam ID');
        } else if (err.message.includes('YAML') || err.message.includes('parse')) {
          setError('Invalid YAML syntax. Please check your edits.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setEncrypting(false);
    }
  };

  return (
    <div className="yaml-viewer-container">
      <div className="yaml-viewer-header">
        <h3>{filename}</h3>
        <button
          className="encrypt-button"
          onClick={handleEncrypt}
          disabled={encrypting}
        >
          {encrypting ? 'Encrypting...' : 'Encrypt This'}
        </button>
      </div>
      <div className="yaml-viewer-content">
        <Editor
          height="600px"
          defaultLanguage="yaml"
          theme="vs-dark"
          value={editedContent}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
      {error && (
        <div className="yaml-viewer-message error">
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div className="yaml-viewer-message success">
          <strong>Success:</strong> {success}
        </div>
      )}
    </div>
  );
}

export default YamlViewer;
