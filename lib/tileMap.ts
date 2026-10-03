export interface MapTile {
  x: number;
  y: number;
  left: number;
  top: number;
}

import Constants from 'expo-constants';

const TILE_SIZE = 256;

export const lonToWorldX = (longitude: number, zoom: number) =>
  ((longitude + 180) / 360) * Math.pow(2, zoom) * TILE_SIZE;

export const latToWorldY = (latitude: number, zoom: number) => {
  const latRad = (latitude * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * TILE_SIZE;
};

export const getMapTiles = (
  latitude: number,
  longitude: number,
  zoom: number,
  width: number,
  height: number
): MapTile[] => {
  const centerX = lonToWorldX(longitude, zoom);
  const centerY = latToWorldY(latitude, zoom);

  const left = Math.floor((centerX - width / 2) / TILE_SIZE);
  const top = Math.floor((centerY - height / 2) / TILE_SIZE);
  const right = Math.floor((centerX + width / 2) / TILE_SIZE);
  const bottom = Math.floor((centerY + height / 2) / TILE_SIZE);

  const tiles: MapTile[] = [];
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      tiles.push({
        x,
        y,
        left: x * TILE_SIZE - (centerX - width / 2),
        top: y * TILE_SIZE - (centerY - height / 2),
      });
    }
  }
  return tiles;
};

const CARTO_SUBDOMAINS = ["a", "b", "c", "d"];

/**
 * Default zoom level matching web config (config/staticmap.php: zoom=17)
 */
export const DEFAULT_MAP_ZOOM = 17;

/**
 * Builds a CARTO tile URL with optional API key.
 * Matches web StaticMapService::tileUrl() logic.
 */
export const tileUrl = (x: number, y: number, zoom: number, apiKey?: string) => {
  const subdomain = CARTO_SUBDOMAINS[Math.abs(x + y) % CARTO_SUBDOMAINS.length];
  const baseUrl = `https://${subdomain}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}.png`;
  if (apiKey) {
    return `${baseUrl}?key=${apiKey}`;
  }
  return baseUrl;
};

/**
 * Gets the CARTO API key from Expo config / environment.
 * Set EXPO_PUBLIC_CARTO_API_KEY in app.config.js or .env
 */
export const getCartoApiKey = (): string | undefined => {
  // @ts-ignore - Expo constants may not be available in test environment
  return Constants?.expoConfig?.extra?.CARTO_API_KEY ?? process.env.EXPO_PUBLIC_CARTO_API_KEY;
};