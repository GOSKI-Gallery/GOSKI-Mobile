import '../../jest.setup.js';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LocationMapModal from '../../components/post/LocationMapModal';

describe('LocationMapModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the static map image with the correct OSM url', () => {
    const { getByTestId } = render(
      <LocationMapModal
        visible
        latitude={-14.8871}
        longitude={-47.8071}
        locationName="Alto Paraíso de Goiás"
        onClose={onClose}
      />
    );

    const image = getByTestId('location-map-image');
    expect(image.props.source.uri).toBe(
      'https://staticmap.openstreetmap.de/staticmap.php?center=-14.8871,-47.8071&zoom=15&size=600x400&maptype=mapnik&markers=-14.8871,-47.8071,red'
    );
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
});