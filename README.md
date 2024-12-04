# PurpleHawk

![PurpleHawk](img/PurpleHawk.jpg)

A Chrome extension that enhances DexScreener by replacing Ethereum addresses with corresponding Farcaster usernames. PurpleHawk seamlessly integrates Farcaster's social layer into your DeFi experience.

## Features

- 🔄 Real-time address resolution to Farcaster usernames
- 🎯 Smart detection of wallet addresses in various formats
- ⚡ Efficient caching system for rapid lookups
- 🔗 Direct links to Warpcast profiles
- 💜 Distinctive purple styling for Farcaster names

## Installation

1. Clone this repository
```bash
git clone https://github.com/developerfred/purplehawk.git
cd purplehawk
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
CACHE_DURATION=3600000
NEYNAR_API_KEY=your_api_key_here
NEYNAR_API_URL=https://api.neynar.com
```

4. Build the extension
```bash
npm run build
```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from the project

## Development

Run the development build with:
```bash
npm run dev
```

This will watch for file changes and rebuild automatically.

## How it works

PurpleHawk works by:
1. Monitoring DexScreener pages for wallet addresses
2. Batch-fetching Farcaster usernames using the Neynar API
3. Caching resolved names for better performance
4. Replacing addresses with clickable Farcaster usernames

## Technical Details

- Built with TypeScript for type safety
- Uses Webpack for bundling
- Implements efficient caching to minimize API calls
- Batch processes address resolution for better performance
- Uses MutationObserver for dynamic content updates

## Configuration

The extension can be configured via environment variables:

- `CACHE_DURATION`: Duration to cache resolved names (in milliseconds)
- `NEYNAR_API_KEY`: Your Neynar API key
- `NEYNAR_API_URL`: Neynar API endpoint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some purple feature'`)
4. Push to the branch (`git push origin feature/purple-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits
- [Codinsh](https://warpcast.com/codingsh)

Built with ❤️ using:
- [Neynar API](https://neynar.com/) for Farcaster integration
- [TypeScript](https://www.typescriptlang.org/)
- [Webpack](https://webpack.js.org/)