import '../../jest.setup.js';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePostModal from '../../components/post/CreatePostModal';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { useAuthStore } from '../../states/useAuthStore';
import { useModalStore } from '../../states/useModalStore';
import uploadPost from '../../services/postService';

jest.mock('expo-image-picker');
jest.mock('../../services/postService');
jest.mock('../../states/useAuthStore');
jest.mock('../../states/useModalStore');
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

const useAuthStoreMock = useAuthStore as unknown as jest.Mock;
const useModalStoreMock = useModalStore as unknown as jest.Mock;
const uploadPostMock = uploadPost as jest.Mock;
const launchImageLibraryAsyncMock = ImagePicker.launchImageLibraryAsync as jest.Mock;
const launchCameraAsyncMock = ImagePicker.launchCameraAsync as jest.Mock;
const manipulateAsyncMock = manipulateAsync as jest.Mock;
const requestForegroundPermissionsAsyncMock = Location.requestForegroundPermissionsAsync as jest.Mock;
const getCurrentPositionAsyncMock = Location.getCurrentPositionAsync as jest.Mock;
const reverseGeocodeAsyncMock = Location.reverseGeocodeAsync as jest.Mock;

describe('CreatePostModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const authState = { user: { id: '123', username: 'test', profile_photo_url: '' } };
    useAuthStoreMock.mockImplementation((selector) => (selector ? selector(authState) : authState));

    useModalStoreMock.mockReturnValue({
      isCreatePostModalVisible: true,
      closeCreatePostModal: jest.fn(),
    });

    manipulateAsyncMock.mockResolvedValue({
      uri: 'cropped-uri',
      width: 500,
      height: 500,
    });
  });

  it('opens the source picker when the upload button is pressed', () => {
    const { getByText } = render(<CreatePostModal />);

    fireEvent.press(getByText('Escolher foto'));

    expect(getByText('Tirar foto')).toBeTruthy();
    expect(getByText('Escolher da galeria')).toBeTruthy();
  });

  it('takes a photo with the camera when "Tirar foto" is selected', async () => {
    launchCameraAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'camera-image-uri' }],
    });
    const { getByText } = render(<CreatePostModal />);

    fireEvent.press(getByText('Escolher foto'));
    fireEvent.press(getByText('Tirar foto'));

    await waitFor(() => expect(launchCameraAsyncMock).toHaveBeenCalled());
    await waitFor(() => expect(getByText('Confirmar')).not.toBeDisabled());
  });

  it('picks from the gallery when "Escolher da galeria" is selected', async () => {
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    });
    const { getByText } = render(<CreatePostModal />);

    fireEvent.press(getByText('Escolher foto'));
    fireEvent.press(getByText('Escolher da galeria'));

    await waitFor(() => expect(launchImageLibraryAsyncMock).toHaveBeenCalled());
  });

  it('keeps the composer open after cropping', async () => {
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    });

    const { getByText, queryByText } = render(<CreatePostModal />);

    fireEvent.press(getByText('Escolher foto'));
    fireEvent.press(getByText('Escolher da galeria'));
    await waitFor(() => expect(getByText('Confirmar')).not.toBeDisabled());

    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => expect(queryByText('Confirmar')).toBeNull());
    expect(getByText('Publicar')).toBeTruthy();
    expect(getByText('Nova Publicação')).toBeTruthy();
  });

  it('handles image picking, cropping, and post publishing', async () => {
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    });
    uploadPostMock.mockResolvedValueOnce({ id: 'post1' });

    const { getByText, getByPlaceholderText, queryByText } = render(<CreatePostModal />);

    fireEvent.press(getByText('Escolher foto'));
    fireEvent.press(getByText('Escolher da galeria'));
    await waitFor(() => expect(launchImageLibraryAsyncMock).toHaveBeenCalled());

    await waitFor(() => {
      expect(getByText('Confirmar')).not.toBeDisabled();
    });

    fireEvent.press(getByText('Confirmar'));

    await waitFor(() => {
      expect(queryByText('Confirmar')).toBeNull();
    });

    fireEvent.changeText(getByPlaceholderText('Escreva uma legenda...'), 'Test description');

    fireEvent.press(getByText('Publicar'));

    await waitFor(() => {
      expect(uploadPostMock).toHaveBeenCalledWith('123', 'cropped-uri', 'Test description', undefined);
    });
  });

  it('adds a location when the toggle is enabled', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({ coords: { latitude: -14.8871, longitude: -47.8071 } });
    reverseGeocodeAsyncMock.mockResolvedValue([
      { city: 'Alto Paraíso de Goiás', region: 'Goiás', country: 'Brazil' },
    ]);

    const { getByTestId } = render(<CreatePostModal />);

    fireEvent(getByTestId('location-toggle'), 'valueChange', true);

    await waitFor(() => {
      expect(getByTestId('location-name').props.children).toBe('Alto Paraíso de Goiás, Goiás, Brazil');
    });
  });

  it('shows loading hint while resolving location', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({ coords: { latitude: 1, longitude: 2 } }), 50);
    }));
    reverseGeocodeAsyncMock.mockResolvedValue([{ city: 'X', region: null, country: null }]);

    const { getByTestId, queryByTestId } = render(<CreatePostModal />);

    fireEvent(getByTestId('location-toggle'), 'valueChange', true);

    await waitFor(() => {
      expect(getByTestId('location-loading')).toBeTruthy();
    });
  });

  it('removes the location when the toggle is disabled', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({ coords: { latitude: 1, longitude: 2 } });
    reverseGeocodeAsyncMock.mockResolvedValue([{ city: 'X', region: null, country: null }]);

    const { getByTestId, queryByTestId } = render(<CreatePostModal />);

    fireEvent(getByTestId('location-toggle'), 'valueChange', true);
    await waitFor(() => expect(getByTestId('location-name')).toBeTruthy());

    fireEvent(getByTestId('location-toggle'), 'valueChange', false);

    await waitFor(() => {
      expect(queryByTestId('location-name')).toBeNull();
    });
  });

  it('passes the location to uploadPost on publish', async () => {
    requestForegroundPermissionsAsyncMock.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsyncMock.mockResolvedValue({ coords: { latitude: -14.8871, longitude: -47.8071 } });
    reverseGeocodeAsyncMock.mockResolvedValue([
      { city: 'Alto Paraíso de Goiás', region: 'Goiás', country: 'Brazil' },
    ]);

    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    });
    uploadPostMock.mockResolvedValueOnce({ id: 'post1' });

    const { getByText, getByPlaceholderText, getByTestId } = render(<CreatePostModal />);

    fireEvent.press(getByText('Escolher foto'));
    fireEvent.press(getByText('Escolher da galeria'));
    await waitFor(() => expect(getByText('Confirmar')).not.toBeDisabled());
    fireEvent.press(getByText('Confirmar'));
    await waitFor(() => expect(getByPlaceholderText('Escreva uma legenda...')).toBeTruthy());

    fireEvent(getByTestId('location-toggle'), 'valueChange', true);
    await waitFor(() => expect(getByTestId('location-name')).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText('Escreva uma legenda...'), 'Test description');
    fireEvent.press(getByText('Publicar'));

    await waitFor(() => {
      expect(uploadPostMock).toHaveBeenCalledWith(
        '123',
        'cropped-uri',
        'Test description',
        { latitude: -14.8871, longitude: -47.8071, location_name: 'Alto Paraíso de Goiás, Goiás, Brazil' }
      );
    });
  });
});