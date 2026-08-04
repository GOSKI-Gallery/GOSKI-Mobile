import * as Location from "expo-location";

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  location_name?: string;
}

const isValidCoord = (value: number, min: number, max: number) =>
  typeof value === "number" && !Number.isNaN(value) && value >= min && value <= max;

export const locationToPrecision = (value: number) => {
  const factor = 10000000;
  return Math.round(value * factor) / factor;
};

export const isValidLatitude = (value: number) => isValidCoord(value, -90, 90);
export const isValidLongitude = (value: number) => isValidCoord(value, -180, 180);

export async function getLocationName(): Promise<ResolvedLocation | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const latitude = locationToPrecision(pos.coords.latitude);
  const longitude = locationToPrecision(pos.coords.longitude);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return null;
  }

  let location_name: string | undefined;
  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (place) {
      const name = [place.city, place.region, place.country].filter(Boolean).join(", ");
      location_name = name || undefined;
    }
  } catch {
    location_name = undefined;
  }

  return {
    latitude,
    longitude,
    ...(location_name ? { location_name } : {}),
  };
}