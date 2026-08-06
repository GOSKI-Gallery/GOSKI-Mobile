jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

import * as Location from 'expo-location';
import { getLocationName, isValidLatitude, isValidLongitude, locationToPrecision } from '../../lib/location';

const requestForegroundPermissionsAsyncMock = Location.requestForegroundPermissionsAsync as jest.Mock;
const getCurrentPositionAsyncMock = Location.getCurrentPositionAsync as jest.Mock;
const reverseGeocodeAsyncMock = Location.reverseGeocodeAsync as jest.Mock;

describe('getLocationName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when permission is denied', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'denied' });

    const result = await getLocationName();

    expect(result).toBeNull();
    expect(getCurrentPositionAsyncMock).not.toHaveBeenCalled();
  });

  it('resolves location with name', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({
      coords: { latitude: -14.887123456, longitude: -47.807123456 },
    });
    reverseGeocodeAsyncMock.mockResolvedValue([
      { city: 'Alto Paraíso de Goiás', region: 'Goiás', country: 'Brazil' },
    ]);

    const result = await getLocationName();

    expect(result).toEqual({
      latitude: -14.8871235,
      longitude: -47.8071235,
      location_name: 'Alto Paraíso de Goiás, Goiás, Brazil',
    });
  });

  it('prefers the full name when reverse geocode returns one', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({
      coords: { latitude: -14.887123456, longitude: -47.807123456 },
    });
    reverseGeocodeAsyncMock.mockResolvedValue([
      {
        name: 'Rua das Flores, Bairro Centro',
        subregion: 'Bairro Centro',
        district: 'Distrito Alto',
        city: 'Alto Paraíso de Goiás',
        region: 'Goiás',
        country: 'Brazil',
      },
    ]);

    const result = await getLocationName();

    expect(result?.location_name).toBe('Rua das Flores, Bairro Centro');
  });

  it('falls back to subregion/district/city/region hierarchy when name is absent', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({
      coords: { latitude: -14.887123456, longitude: -47.807123456 },
    });
    reverseGeocodeAsyncMock.mockResolvedValue([
      {
        name: '',
        subregion: 'Zona Sul',
        city: 'São Paulo',
        region: 'São Paulo',
        country: 'Brazil',
      },
    ]);

    const result = await getLocationName();

    expect(result?.location_name).toBe('Zona Sul, São Paulo, São Paulo, Brazil');
  });

  it('returns coordinates only when reverse geocode fails', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({
      coords: { latitude: 1.0, longitude: 2.0 },
    });
    reverseGeocodeAsyncMock.mockRejectedValue(new Error('no result'));

    const result = await getLocationName();

    expect(result).toEqual({ latitude: 1.0, longitude: 2.0 });
  });

  it('returns null when coordinates are out of range', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({
      coords: { latitude: 95, longitude: 200 },
    });

    const result = await getLocationName();

    expect(result).toBeNull();
    expect(reverseGeocodeAsyncMock).not.toHaveBeenCalled();
  });
});

describe('coordinate helpers', () => {
  it('rounds coordinates to 7 decimals', () => {
    expect(locationToPrecision(-14.887123456)).toBe(-14.8871235);
  });

  it('validates latitude bounds', () => {
    expect(isValidLatitude(90)).toBe(true);
    expect(isValidLatitude(-90)).toBe(true);
    expect(isValidLatitude(90.1)).toBe(false);
    expect(isValidLatitude(NaN)).toBe(false);
  });

  it('validates longitude bounds', () => {
    expect(isValidLongitude(180)).toBe(true);
    expect(isValidLongitude(-180)).toBe(true);
    expect(isValidLongitude(180.1)).toBe(false);
  });
});