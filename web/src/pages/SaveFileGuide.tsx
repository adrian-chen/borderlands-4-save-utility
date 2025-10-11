import { Link } from 'react-router-dom';
import './GuidePage.css';

function SaveFileGuide() {
  return (
    <div className="app">
      <header>
        <h1>How to Find Your Save Files</h1>
        <p>Locate your Borderlands 4 save files for encryption and decryption</p>
      </header>

      <main>
        <div className="guide-container">
          <nav className="guide-nav">
            <Link to="/steam-id" className="nav-button">← Find Steam ID</Link>
            <Link to="/" className="nav-button">Back to Editor →</Link>
          </nav>

          <div className="guide-content">
            <section className="guide-section">
              <h2>Borderlands 4 Save Location (Windows)</h2>
              <div className="path-box">
                <strong>Full Path:</strong>
                <code className="file-path">
                  C:\Users\[YourUsername]\Documents\My Games\Borderlands 4\Saved\SaveGames\[SteamID]\
                </code>
              </div>
              <div className="path-box shortcut">
                <strong>Quick Access (paste in Windows Explorer):</strong>
                <code className="file-path">
                  %USERPROFILE%\Documents\My Games\Borderlands 4\
                </code>
              </div>
            </section>

            <section className="guide-section">
              <h2>Step-by-Step Instructions</h2>
              <div className="method-steps">
                <ol>
                  <li>
                    <strong>Open Windows File Explorer</strong>
                    <p>Press <kbd>Windows Key + E</kbd> or click the folder icon in your taskbar</p>
                  </li>
                  <li>
                    <strong>Navigate to Save Location</strong>
                    <p>Click in the address bar at the top and paste this path:</p>
                    <code>%USERPROFILE%\Documents\My Games\Borderlands 4\</code>
                    <p>Press <kbd>Enter</kbd></p>
                  </li>
                  <li>
                    <strong>Navigate to SaveGames Folder</strong>
                    <p>Open the <code>Saved</code> folder, then <code>SaveGames</code></p>
                    <p>You'll see a folder named with your Steam ID (17-digit number)</p>
                  </li>
                  <li>
                    <strong>Find Your Save Files</strong>
                    <p>Inside the Steam ID folder, you'll find your save files</p>
                  </li>
                </ol>
              </div>
            </section>

            <section className="guide-section">
              <h2>Understanding Save Files</h2>
              <div className="save-types">
                <div className="save-type">
                  <h3>Character Saves (1.sav, 2.sav, 3.sav, etc.)</h3>
                  <p>
                    Each numbered .sav file represents one character slot. These files contain:
                  </p>
                  <ul>
                    <li>Character level, experience, and skill points</li>
                    <li>Inventory items, equipped gear, and weapons</li>
                    <li>Story progress and completed missions</li>
                    <li>Guardian Rank and other character-specific data</li>
                  </ul>
                  <div className="info-box">
                    <strong>Example:</strong> If you have 3 characters, you'll have <code>1.sav</code>, <code>2.sav</code>, and <code>3.sav</code>
                  </div>
                </div>

                <div className="save-type">
                  <h3>Profile.sav</h3>
                  <p>
                    Contains account-wide data that applies to all your characters:
                  </p>
                  <ul>
                    <li>Cosmetics and skins</li>
                    <li>Unlocked customization options</li>
                    <li>Account-wide achievements and settings</li>
                    <li>Golden Keys and other account rewards</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>Backing Up Your Saves</h2>
              <div className="backup-steps">
                <p><strong>Always backup before modifying save files!</strong></p>
                <ol>
                  <li>Navigate to your save file folder (see instructions above)</li>
                  <li>Select all .sav files (or just the ones you want to backup)</li>
                  <li>Right-click and choose "Copy"</li>
                  <li>Create a new folder named "Backup [Date]" (e.g., "Backup 2025-10-10")</li>
                  <li>Paste the files into the backup folder</li>
                </ol>
                <div className="warning-box">
                  <strong>Important:</strong> Keep multiple dated backups. If something goes wrong,
                  you can restore from a backup by copying the files back to the SaveGames folder.
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>Steam Cloud Saves</h2>
              <p>
                Borderlands 4 supports Steam Cloud, which automatically backs up your saves to Steam's servers.
              </p>
              <div className="cloud-info">
                <h3>Benefits:</h3>
                <ul>
                  <li>Access your saves on different computers</li>
                  <li>Automatic backup protection</li>
                  <li>Sync across devices when logged into Steam</li>
                </ul>
                <h3>Important Notes:</h3>
                <ul>
                  <li>Modified saves will sync to the cloud when you close the game</li>
                  <li>If you're testing modifications, consider disabling cloud saves temporarily</li>
                  <li>To disable: Right-click Borderlands 4 in Steam → Properties → General → Uncheck "Enable Steam Cloud"</li>
                </ul>
              </div>
            </section>

            <section className="guide-section">
              <h2>Linux Save Location</h2>
              <div className="path-box">
                <strong>Steam Play / Proton Path:</strong>
                <code className="file-path">
                  ~/.steam/steam/steamapps/compatdata/[AppID]/pfx/drive_c/users/steamuser/Documents/My Games/Borderlands 4/
                </code>
              </div>
              <p>
                Replace <code>[AppID]</code> with Borderlands 4's Steam App ID. Navigate to the SaveGames folder
                within this path to find your save files.
              </p>
            </section>

            <section className="guide-section">
              <h2>Troubleshooting</h2>
              <div className="troubleshooting">
                <div className="trouble-item">
                  <h3>Can't find the Borderlands 4 folder?</h3>
                  <p>
                    Make sure you've launched the game at least once to create the save folder structure.
                    If the game was just installed, play for a few minutes and create a character first.
                  </p>
                </div>
                <div className="trouble-item">
                  <h3>SaveGames folder is empty?</h3>
                  <p>
                    This usually means you haven't created a character yet. Launch the game, create
                    a new character, and save the game. The .sav files will appear after saving.
                  </p>
                </div>
                <div className="trouble-item">
                  <h3>Multiple Steam ID folders?</h3>
                  <p>
                    If you've logged into different Steam accounts on the same PC, you might see
                    multiple Steam ID folders. Each one corresponds to a different Steam account's saves.
                  </p>
                </div>
                <div className="trouble-item">
                  <h3>Which .sav file is which character?</h3>
                  <p>
                    The files are numbered in the order you created your characters. Your first character
                    is 1.sav, second is 2.sav, etc. Check the file's "Date Modified" to see which was used most recently.
                  </p>
                </div>
              </div>
            </section>

            <section className="guide-section">
              <h2>Other Borderlands Games</h2>
              <div className="other-games">
                <h3>Borderlands 3</h3>
                <code className="file-path">
                  %USERPROFILE%\Documents\My Games\Borderlands 3\Saved\SaveGames\[SteamID]\
                </code>

                <h3>Borderlands 2</h3>
                <code className="file-path">
                  %USERPROFILE%\Documents\My Games\Borderlands 2\WillowGame\SaveData\[RandomNumber]\
                </code>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Note: This tool is designed for Borderlands 4 and may not work with previous games.
                </p>
              </div>
            </section>

            <div className="next-steps">
              <h2>Ready to Edit Your Saves?</h2>
              <p>Now that you know where your save files are, you can start using the editor:</p>
              <Link to="/" className="cta-button">
                Go to Save Editor →
              </Link>
              <p style={{ marginTop: '1rem' }}>Need help finding your Steam ID?</p>
              <Link to="/steam-id" className="secondary-button">
                How to Find Steam ID
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

export default SaveFileGuide;
