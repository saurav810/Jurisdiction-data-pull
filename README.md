# Jurisdiction Data Pull

A client-side React + TypeScript application for querying Census jurisdiction population data using USWDS (U.S. Web Design System) components.

## Overview

This application allows users to:
- Search and select U.S. states, cities/places, and counties
- Query population estimates and GEOID/FIPS codes
- Build multiple queries and view results in a table
- All data processing happens client-side using local CSV files

## Features

- **USWDS Components**: Uses @trussworks/react-uswds for accessible, government-standard UI components
- **Searchable Dropdowns**: ComboBox components for easy navigation of 50+ states and thousands of jurisdictions
- **Dual Data Sources**: 
  - Places/Cities from `sub-est2024.csv`
  - Counties from `co-est2024-alldata.csv`
- **Multiple Selection Basket**: Add multiple queries and see all results at once
- **Fast Performance**: Data is parsed once on load and indexed for instant filtering

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Data Files

The application expects two CSV files in the `public/data/` directory:

- `sub-est2024.csv` - Population estimates for places/cities
- `co-est2024-alldata.csv` - Population estimates for counties

These files are parsed client-side using PapaParse.

## Usage

1. **Select a State**: Use the searchable dropdown to find and select a state
2. **Choose Jurisdiction Type**: Select either "City/Place" or "County"
3. **Select Jurisdiction**: Choose a specific city/place or county (filtered by selected state)
4. **Choose Metric**: Select either:
   - Population estimate (2024)
   - Population estimate (2023)
   - GEOID / FIPS code
5. **Add Selection**: Click "Add selection" to add the query to your basket
6. **View Results**: All selections appear in the results table below
7. **Manage Selections**: Remove individual selections or clear all at once

## Technical Details

### Code Formatting

- **Place GEOID**: 7-digit code = STATE (2 digits) + PLACE (5 digits)
- **County FIPS**: 5-digit code = STATE (2 digits) + COUNTY (3 digits)
- All codes are zero-padded to maintain proper length

### Data Indexing

The application builds in-memory indexes on startup:
- States list (sorted alphabetically)
- Places grouped by state FIPS
- Counties grouped by state FIPS
- Lookup maps for fast retrieval by code

### Technologies Used

- **React 19** with TypeScript
- **Vite** for build tooling
- **@trussworks/react-uswds** for USWDS components
- **PapaParse** for CSV parsing
- **USWDS 3.0** design system

## Project Structure

```
jurisdiction-data-pull/
├── public/
│   └── data/
│       ├── sub-est2024.csv
│       └── co-est2024-alldata.csv
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # App-specific styles
│   ├── main.tsx         # Entry point with USWDS imports
│   └── index.css        # Minimal global styles
├── package.json
├── vite.config.ts
└── README.md
```

## License

This project uses U.S. Census Bureau data and follows USWDS design standards for government applications.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
