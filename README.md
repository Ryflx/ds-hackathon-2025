# Demo Configuration Tool - Chrome Extension

A modern Chrome extension for configuring IAM (Intelligent Agreement Management) and CLM (Contract Lifecycle Management) demos with a sleek, professional interface.

## Features

- **Demo Type Selection**: Choose between IAM and CLM configurations
- **Dynamic Components**: Component options change based on selected demo type
- **Persona Management**: Enter and manage persona names
- **Stage Selection**: Configure demo stages (Create, Commit, Manage)
- **Modern UI**: Clean, gradient-based design with smooth animations
- **Data Persistence**: Saves your configuration automatically
- **Responsive Design**: Optimized for the Chrome extension popup format

## Installation

1. **Download the Extension**
   - Clone or download this repository to your local machine

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the folder containing these files
   - The extension icon should appear in your Chrome toolbar

3. **Usage**
   - Click the extension icon in your Chrome toolbar
   - Fill out the demo configuration form:
     - Select demo type (IAM or CLM)
     - Enter a persona name
     - Choose relevant components
     - Select a demo stage
   - Click "Configure Demo" to see your configuration summary
   - Use "Reset" to clear all selections

## File Structure

```
├── manifest.json          # Extension configuration
├── popup.html            # Main interface HTML
├── popup.js              # JavaScript functionality
├── styles.css            # Modern styling
├── README.md             # This file
└── docs/
    └── images/
        └── UI.png         # Design reference
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: ActiveTab (minimal permissions required)
- **Storage**: Uses Chrome's local storage API for persistence
- **Responsive**: 400px width optimized for extension popup

## Component Options

### IAM (Intelligent Agreement Management)
- Document Intelligence
- Contract Analysis  
- Risk Assessment
- Compliance Check
- Automated Review
- Agreement Templates

### CLM (Contract Lifecycle Management)
- Doc Gen
- External Review
- Legal Review
- Approval
- Signature

## Browser Compatibility

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

## Development

To modify or extend this extension:

1. Make changes to the relevant files
2. Reload the extension in `chrome://extensions/`
3. Test your changes by clicking the extension icon

## License

This project is open source and available under the MIT License. 