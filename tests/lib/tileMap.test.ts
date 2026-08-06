import { getMapTiles, lonToWorldX, latToWorldY, tileUrl } from '../../lib/tileMap';

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
    const tiles = getMapTiles(-14.8871, -47.8071, 15, width, height);

    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) {
      expect(Number.isInteger(tile.x)).toBe(true);
      expect(Number.isInteger(tile.y)).toBe(true);
    }
  });

  it('builds a valid tile url', () => {
    expect(tileUrl(2, 1, 15)).toBe('https://tile.openstreetmap.org/15/2/1.png');
  });
});