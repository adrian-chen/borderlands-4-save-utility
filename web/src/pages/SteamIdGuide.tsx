import { Link } from 'react-router-dom';
import './GuidePage.css';

function SteamIdGuide() {
  return (
    <div className="app">
      <header>
        <h1>How to Find Your Steam ID</h1>
        <p>Your 17-digit SteamID64 is required to encrypt/decrypt Borderlands 4 save files</p>
      </header>

      <main>
        <div className="guide-container">
          <nav className="guide-nav">
            <Link to="/" className="nav-button">← Back to Editor</Link>
            <Link to="/save-location" className="nav-button">Find Save Files →</Link>
          </nav>

          <div className="guide-content">
            <section className="guide-section">
              <h2>What is a Steam ID?</h2>
              <p>
                Your Steam ID (also called SteamID64 or Community ID) is a unique 17-digit number
                assigned to your Steam account. It always starts with <code>7656119</code> and is
                used by the save encryption system to generate a unique key for your save files.
              </p>
              <div className="example-box">
                <strong>Example Steam ID:</strong>
                <code className="steam-id-example">76561198012345678</code>
              </div>
            </section>

            <section className="guide-section">
              <h2>Method 1: Through Steam Account Details (Easiest)</h2>
              <div className="method-steps">
                <ol>
                  <li>
                    <strong>Open Steam</strong>
                    <p>Launch the Steam application or visit <a href="https://store.steampowered.com" target="_blank" rel="noopener noreferrer">store.steampowered.com</a> in your web browser</p>
                  </li>
                  <li>
                    <strong>Access Account Details</strong>
                    <p>Click your username in the top-right corner of the window</p>
                    <p>Select <strong>"Account details"</strong> from the dropdown menu</p>
                  </li>
                  <li>
                    <strong>Find Your Steam ID</strong>
                    <p>Your 17-digit Steam ID appears near the top of the page, right below your Steam username</p>
                  </li>
                </ol>
              </div>
            </section>

            <section className="guide-section">
              <h2>Method 2: Through Profile Settings</h2>
              <div className="method-steps">
                <ol>
                  <li>
                    <strong>Open Steam Application</strong>
                    <p>Launch the Steam client on your computer</p>
                  </li>
                  <li>
                    <strong>Edit Your Profile</strong>
                    <p>Click on your profile name in the top-right corner</p>
                    <p>Select <strong>"Edit Profile"</strong> from the dropdown menu</p>
                  </li>
                  <li>
                    <strong>Check Custom URL Section</strong>
                    <p>Scroll down to the "Custom URL" section</p>
                    <p>If the Custom URL field is empty, your Steam ID will be displayed below it</p>
                    <p>It will be shown as: <code>https://steamcommunity.com/profiles/76561198XXXXXXXXX</code></p>
                    <p>The 17-digit number at the end is your Steam ID</p>
                  </li>
                </ol>
              </div>
            </section>

            <section className="guide-section">
              <h2>Method 3: Using Online Tools</h2>
              <p>
                Several websites can help you find your Steam ID by entering your profile URL or username:
              </p>
              <ul className="tool-list">
                <li>
                  <a href="https://steamidfinder.com" target="_blank" rel="noopener noreferrer">
                    <strong>steamidfinder.com</strong>
                  </a> - Simple interface, enter your Steam profile URL or username
                </li>
                <li>
                  <a href="https://steamid.io" target="_blank" rel="noopener noreferrer">
                    <strong>steamid.io</strong>
                  </a> - Shows multiple ID formats and conversions
                </li>
                <li>
                  <a href="https://steamid.xyz" target="_blank" rel="noopener noreferrer">
                    <strong>steamid.xyz</strong>
                  </a> - Quick lookup and batch conversion
                </li>
              </ul>
              <div className="info-box">
                <strong>How to use:</strong>
                <ol>
                  <li>Visit any of the websites above</li>
                  <li>Enter your Steam profile URL (e.g., <code>https://steamcommunity.com/id/yourname</code>)</li>
                  <li>The tool will display your SteamID64 (the 17-digit number you need)</li>
                </ol>
              </div>
            </section>

            <section className="guide-section">
              <h2>Troubleshooting</h2>
              <div className="troubleshooting">
                <div className="trouble-item">
                  <h3>Can't find Steam ID in Account Details?</h3>
                  <p>Make sure you're logged into Steam. The Account Details page requires authentication.</p>
                </div>
                <div className="trouble-item">
                  <h3>Getting "Wrong Steam ID" errors?</h3>
                  <p>
                    The Steam ID must match the original save file owner. If you're trying to decrypt
                    someone else's save file, you need their Steam ID, not yours.
                  </p>
                </div>
                <div className="trouble-item">
                  <h3>Steam ID doesn't start with 7656119?</h3>
                  <p>
                    Make sure you're using the SteamID64 format (17 digits), not the legacy Steam ID
                    (e.g., STEAM_0:1:12345) or Steam3 ID format.
                  </p>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>Privacy &amp; Security Notes</h2>
              <ul className="privacy-notes">
                <li>Your Steam ID is public information - anyone can look it up from your profile</li>
                <li>It's safe to share your Steam ID, unlike your password or login credentials</li>
                <li>This tool processes everything locally in your browser - your Steam ID never leaves your device</li>
                <li>The Steam ID is only used to derive the encryption key for your save files</li>
              </ul>
            </section>

            <div className="next-steps">
              <h2>Next Steps</h2>
              <p>Now that you have your Steam ID, you'll need to locate your save files:</p>
              <Link to="/save-location" className="cta-button">
                Find Your Save Files →
              </Link>
              <p style={{ marginTop: '1rem' }}>Or go back to the editor if you're ready:</p>
              <Link to="/" className="secondary-button">
                Go to Editor
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <p>
          Made with ❤️ for Borderlands 4 | <a href="https://github.com/adrian-chen/borderlands-4-save-utility" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default SteamIdGuide;
