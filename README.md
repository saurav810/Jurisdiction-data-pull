# Jurisdiction Dashboard Map

A client-side React + TypeScript application that visualizes jurisdiction dashboards sourced from a live Google Sheets CSV feed.

## Overview

- Fetches dashboards directly from the published CSV with cache-busting and a manual/automatic refresh.
- Supports both city (place) and county jurisdiction IDs while keeping leading zeros intact.
- Provides filters for government type and population size that drive both the map styling and the results list.
- Clicking a polygon opens details for every matching dashboard (multiple entries per jurisdiction ID are supported).

## Data source

The app loads the published Google Sheets CSV at runtime:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vSQ_zWTMJ46aF_Nw3R5rw_Tq7PMpFnZ099zkFsXwSP1nge546f0PeisEOpBZ3gJQUdxHFrsOP8votEV/pub?output=csv
```

A timestamp query parameter (`t=Date.now()`) is appended to avoid stale caching, and fetch requests use `cache: "no-store"`. Data automatically refreshes every 60 seconds, and a **Refresh data** button forces a reload.

## Running locally

```bash
npm install
npm run dev
```

The development server starts on `http://localhost:5173` by default.

## Key behaviors

- **Parsing & normalization**: CSV headers are mapped to code-friendly keys; `Jurisdiction ID` is always treated as a string. Government types are split on commas, unified governments are detected via notes or combined city+county types, and a display-friendly label is generated.
- **Filters**: Government type (City, County, Unified City–County, Other Public Agency when present) and multi-select population size filters control both the map shading and the results table. A reset action clears all filters.
- **Map join**: Polygon features are joined by matching `jurisdictionId === GEOID`. A polygon is highlighted when any filtered row matches its ID, and multiple rows per jurisdiction are preserved.
- **Details panel**: Clicking a polygon opens a modal that lists all matching dashboards with jurisdiction name, ID, government type, population size, notes, and a link to the dashboard.
- **Error handling**: If the CSV fails to load or parse, a visible alert is shown while keeping the last successful dataset available.

## Tech stack

- React 19 + TypeScript
- USWDS components via `@trussworks/react-uswds`
- PapaParse for CSV parsing
