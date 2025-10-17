function HowItWorksContent() {
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="info-section">
          <h2>How It Works</h2>

          <h3>Step 1: Decrypt Your Save</h3>
          <ol>
            <li>Enter your Steam ID (17 digits)</li>
            <li>Select your .sav file (1.sav, 2.sav, etc.)</li>
            <li>Click "Decrypt" to view your save as editable YAML</li>
          </ol>

          <h3>Step 2: Edit In Your Browser</h3>
          <ol>
            <li>The YAML editor appears with your decrypted save data</li>
            <li>Edit any values directly in the browser (experience, level, inventory, etc.)</li>
          </ol>

          <h3>Step 3: Modify Item Serials (Optional)</h3>
          <ol>
            <li>Switch to the "Item Modification" tab</li>
            <li>Paste an item serial from your YAML (starts with @Ug)</li>
            <li>Edit decoded stats like damage, rarity, and manufacturer</li>
            <li>Click "Replace All Instances" to update the serial in your YAML</li>
          </ol>

          <h3>Step 4: Encrypt Back to .sav</h3>
          <ol>
            <li>After editing, click the "Encrypt This" button in the editor header</li>
            <li>Your modified .sav file downloads automatically</li>
            <li>Replace your original save file with the new one</li>
          </ol>

          <h3>Important Notes</h3>
          <ul>
            <li><strong>Backup your saves!</strong> This tool modifies save files.</li>
            <li>Only Steam saves are currently supported</li>
            <li>Steam ID must match the original save file owner</li>
            <li>Edit numbered saves (1.sav, 2.sav) for game progress</li>
            <li>Edit Profile.sav for cosmetics</li>
            <li><strong>Item Serial Editing:</strong> Only "high confidence" decoded items are recommended for editing</li>
          </ul>

          <h3>Common Questions</h3>
          <h4>What is YAML?</h4>
          <p>YAML is a human-readable data format. Your save file is encrypted binary data, but when decrypted it becomes editable YAML text with key-value pairs like <code>level: 40</code> or <code>experience: 1000000</code>.</p>

          <h4>Is this safe?</h4>
          <p>This tool runs entirely in your browser - no data is sent to any server. Always backup your save files before editing. Invalid edits may corrupt your save.</p>

          <h4>What can I edit?</h4>
          <p>You can modify character stats (level, experience, skill points), inventory items, currency, quest progress, and more. With item serial decoding, you can also edit weapon stats like damage and rarity.</p>

          <h4>Why do I need my Steam ID?</h4>
          <p>Borderlands 4 encrypts save files using your Steam ID as part of the encryption key. This prevents saves from being shared between accounts.</p>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksContent;
