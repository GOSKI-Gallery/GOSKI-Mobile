import { getMapTiles, lonToWorldX, latToWorldY, tileUrl, DEFAULT_MAP_ZOOM } from '../../lib/tileMap';

describe('tileMap', () => {
  it('converts longitude to world x at a given zoom', () => {
    expect(lonToWorldX(0, 0)).toBe(128);
    expect(lonToWorldX(0, 1)).toBe(256);
  });

  it('converts latitude to world y at a given zoom', () => {
    expect(latToWorldY(0, 0)).toBe(128);
    expect(latToWorldY(0, 1)).toBe(256);
  });

  it('returns a grid of tiles covering the viewport', () => {
    const width = 300;
    const height = 200;
    // Use DEFAULT_MAP_ZOOM (17) to match updated config
    const tiles = getMapTiles(-14.8871, -47.8071, DEFAULT_MAP_ZOOM, width, height);

    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) {
      expect(Number.isInteger(tile.x)).toBe(true);
      expect(Number.isInteger(tile.y)).toBe(true);
    }
  });

  it('builds a valid tile url without api key', () => {
    const url = tileUrl(2, 1, 15);
    expect(url).toContain('basemaps.cartocdn.com/rastertiles/voyager/15/2/1.png');
    expect(url).toMatch(/^https:\/\/[abcd]\.basemaps\.cartocdn\.com\/rastertiles\/voyager\/15\/2\/1\.png$/);
  });

  it('builds a valid tile url with api key', () => {
    const url = tileUrl(2, 1, 15, 'test-api-key');
    // x=2, y=1 -> abs(2+1)%4 = 3 -> subdomain 'd'
    expect(url).toBe('https://d.basemaps.cartocdn.com/rastertiles/voyager/15/2/1.png?key=test-api-key');
  });

  it('builds a valid tile url with negative tile coordinates', () => {
    const url = tileUrl(-2, -1, 15);
    expect(url).toMatch(/^https:\/\/[abcd]\.basemaps\.cartocdn\.com\/rastertiles\/voyager\/15\/-2\/-1\.png$/);
  });

  it('DEFAULT_MAP_ZOOM is 17 to match web config', () => {
    expect(DEFAULT_MAP_ZOOM).toBe(17);
  });
});