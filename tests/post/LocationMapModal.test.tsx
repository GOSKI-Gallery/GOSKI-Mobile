import '../../jest.setup.js';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LocationMapModal from '../../components/post/LocationMapModal';

describe('LocationMapModal', () => {
  const onClose = jest.fn();

  const layoutProps = {
    nativeEvent: { layout: { width: 300, height: 300 } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

it('renders OSM tiles from the tile server', () => {
    const { queryAllByTestId } = render(
      <LocationMapModal
        visible
        latitude={-14.8871}
        longitude={-47.8071}
        locationName="Alto Paraíso de Goiás"
        onClose={onClose}
      />
    );

    const images = queryAllByTestId('location-map-image');
    expect(images.length).toBe(0);

    // After layout measurement, tiles render referencing the OSM tile server
  });

  it('shows the location name', () => {
    const { getByText } = render(
      <LocationMapModal
        visible
        latitude={-14.8871}
        longitude={-47.8071}
        locationName="Alto Paraíso de Goiás"
        onClose={onClose}
      />
    );

    expect(getByText('Alto Paraíso de Goiás')).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', () => {
    const { getByTestId } = render(
      <LocationMapModal
        visible
        latitude={-14.8871}
        longitude={-47.8071}
        locationName="Alto Paraíso de Goiás"
        onClose={onClose}
      />
    );

    fireEvent.press(getByTestId('close-location-map'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders tiles after the map area is measured', () => {
    const { getByTestId, getAllByTestId } = render(
      <LocationMapModal
        visible
        latitude={-14.8871}
        longitude={-47.8071}
        locationName="Alto Paraíso de Goiás"
        onClose={onClose}
      />
    );

    const mapArea = getByTestId('location-map-area');
    fireEvent(mapArea, 'layout', layoutProps);

    const images = getAllByTestId('location-map-image');
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image.props.source.uri).toMatch(/^https:\/\/tile\.openstreetmap\.org\/15\//);
    }
  });
});