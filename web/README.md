# Borderlands 4 Save Editor - Web Version

A web-based tool to decrypt and encrypt Borderlands 4 save files with item serial manipulation. Built with React, TypeScript, and Vite.

## Features

- **Decrypt .sav files** to editable YAML format
- **Encrypt YAML files** back to .sav format
- **Item Serial Decoding** - Extract and edit weapon/equipment stats
- **Drag-and-drop** file upload
- **Client-side processing** - All encryption/decryption happens in your browser
- **No server required** - Your save files never leave your computer

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:7429`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Static Hosting (GitHub Pages, Netlify, Vercel, etc.)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory to your hosting provider

#### GitHub Pages

```bash
# Build
npm run build

# Deploy dist folder to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

#### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

#### Vercel

```bash
# Build command
npm run build

# Output directory
dist
```

## Project Structure

```
web/
├── src/
│   ├── lib/
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── crypto.ts      # AES-ECB encryption, key derivation
│   │   ├── codec.ts       # Bit-packing encode/decode
│   │   ├── items.ts       # Item stat decoders
│   │   └── yaml.ts        # YAML transformation pipeline
│   ├── App.tsx            # Main React component
│   ├── App.css            # Application styles
│   └── main.tsx           # React entry point
├── index.html
├── package.json
└── vite.config.ts
```

## How It Works

The web version implements the same cryptography and item serial manipulation as the Python CLI:

1. **Encryption Layer**: AES-ECB with Steam ID-derived keys, zlib compression
2. **Bit-Packing Codec**: Custom base-78 encoding for item serials
3. **Item Decoders**: Type-specific decoders for weapons and equipment
4. **YAML Pipeline**: Manages `_DECODED_ITEMS` section for editing stats

All processing happens client-side using Web Crypto API and browser-native libraries.

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 91+
- Safari 15+

Requires Web Crypto API support for AES encryption.

## License

MIT License - See parent directory LICENSE file
