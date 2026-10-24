# Changelog

## Unreleased — Natural Earth Map Replacement

### Added
- Self-contained Natural Earth world map using public-domain geographic data.
- Country borders with a dark theme matching the CKB Node Probe dashboard.
- Antimeridian geometry correction for Russia and Fiji.
- Polygon clipping to prevent rendering artifacts at the International Date Line.

### Changed
- Replaced CARTO raster tiles with locally bundled Natural Earth geographic data.
- Preserved Leaflet zoom, fullscreen, node heatmap and node search functionality.
- Excluded Antarctica to improve the world map presentation.
- Improved node-search notification handling.

### Fixed
- Removed the CARTO "API KEY REQUIRED" map watermark.
- Fixed horizontal rendering artifacts caused by polygons crossing the International Date Line.

### Dependencies
- Added world-atlas, topojson-client and polygon-clipping.
- Added TypeScript declarations for topojson-client.

### Benefits
- No external map tile provider or mapping API key required.
- No external map tile requests.
- Improved reliability and maintainability.
- Preserves compatibility with the existing CKB node monitoring backend.
