# WiFi Sightseer 📡

A privacy-first WiFi wardriving data visualization tool that analyzes and visualizes WiFi network security data from Kismet wardriving sessions. All processing is done locally in your browser for maximum privacy and security.

## 🌟 Features

### 📊 **Comprehensive Dashboard**
- **Security Analysis**: Categorizes networks by security level (Secure, Outdated, Insecure, Enterprise)
- **Channel Distribution**: Visualizes WiFi channel usage and congestion
- **Manufacturer Analysis**: Identifies device manufacturers from MAC addresses
- **Signal Strength Mapping**: Analyzes RSSI data for coverage patterns
- **Temporal Analysis**: Shows network discovery patterns over time

### 🗺️ **Interactive Map Visualization**
- **Clustered Markers**: Efficiently displays thousands of access points
- **Security Color Coding**: Visual security assessment at a glance
- **Detailed Popups**: Complete network information on click
- **Hidden Network Toggle**: Option to show/hide networks without SSIDs
- **Filtering Options**: Filter by security type, manufacturer, and more

### 📋 **Data Table View**
- **Sortable Columns**: Sort by any network attribute
- **Search Functionality**: Quick filtering across all data
- **Export Capabilities**: Export filtered data for further analysis
- **Detailed Network Info**: Complete technical specifications

### 🔒 **Privacy-First Design**
- **Local Processing**: All data stays in your browser
- **No Server Uploads**: Files are processed entirely client-side
- **No Tracking**: No analytics or data collection
- **Secure by Default**: No external data transmission

## 🚀 Live Demo

Visit the live application: [https://kennyHH.github.io/wifi-sightseer](https://kennyHH.github.io/wifi-sightseer)

## 📋 Supported Data Format

The application expects CSV files with the following columns (header row required):

| Column | Description |
|--------|-------------|
| `MAC` | BSSID of the access point |
| `SSID` | Network name (can be empty for hidden networks) |
| `AuthMode` | Security protocols (WPA2, WPA3, WEP, Open, etc.) |
| `FirstSeen` | First detection timestamp |
| `Channel` | WiFi channel number |
| `RSSI` | Signal strength in dBm |
| `CurrentLatitude` | GPS latitude coordinate |
| `CurrentLongitude` | GPS longitude coordinate |
| `AltitudeMeters` | Altitude in meters |
| `AccuracyMeters` | GPS accuracy in meters |
| `Type` | Network type identifier |

### Example CSV Format:
```csv
MAC,SSID,AuthMode,FirstSeen,Channel,RSSI,CurrentLatitude,CurrentLongitude,AltitudeMeters,AccuracyMeters,Type
AA:BB:CC:DD:EE:FF,MyNetwork,WPA2,2024-01-01 12:00:00,6,-45,40.7128,-74.0060,10,5,infrastructure
```

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation

### UI Components
- **shadcn/ui** - Modern, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Data Visualization
- **Chart.js** with React Chart.js 2 - Interactive charts
- **Recharts** - Additional charting capabilities
- **React Leaflet** - Interactive maps
- **Leaflet Clustering** - Efficient marker clustering

### Data Processing
- **Papa Parse** - Fast CSV parsing
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Form handling
- **React Query** - Data fetching and caching

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kennyHH/wifi-sightseer.git
   cd wifi-sightseer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Deploy to GitHub Pages |

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── Dashboard.tsx    # Main analytics dashboard
│   ├── WiFiMap.tsx      # Interactive map component
│   ├── FileUpload.tsx   # CSV file upload handler
│   └── DataTable.tsx    # Sortable data table
├── pages/               # Page components
│   ├── Index.tsx        # Main application page
│   └── NotFound.tsx     # 404 error page
├── types/               # TypeScript type definitions
│   └── wifi.ts          # WiFi data interfaces
├── utils/               # Utility functions
│   └── csvParser.ts     # CSV parsing and analysis
├── hooks/               # Custom React hooks
├── lib/                 # Shared utilities
└── App.tsx              # Root application component
```

## 🔧 Configuration

### Environment Variables
No environment variables required - the application runs entirely client-side.

### Build Configuration
- **Base Path**: `/wifi-sightseer/` (for GitHub Pages)
- **TypeScript**: Strict mode with path aliases
- **Tailwind**: Custom color scheme for security classifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
1. Follow the existing code style
2. Add TypeScript types for new features
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Kismet** - For the wardriving framework that generates compatible data
- **shadcn/ui** - For the beautiful component library
- **OpenStreetMap** - For the map tiles
- **React Leaflet** - For the mapping components

## 🔐 Security & Privacy

This application is designed with privacy as a core principle:

- ✅ **No data transmission** - All processing happens locally
- ✅ **No tracking** - No analytics or user monitoring
- ✅ **No storage** - Data is not persisted between sessions
- ✅ **Open source** - Full transparency of code and functionality

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/kennyHH/wifi-sightseer/issues) page
2. Create a new issue with detailed information
3. Include sample data (anonymized) if relevant

---

**Made with ❤️ for the cybersecurity and wardriving community**