import '../../jest.setup.js';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePostModal from '../../components/post/CreatePostModal';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../states/useAuthStore';
import uploadPost from '../../services/postService';

// Mock the external modules and services
jest.mock('expo-image-picker');
jest.mock('../../services/postService');
jest.mock('../../states/useAuthStore');

const useAuthStoreMock = useAuthStore as unknown as jest.Mock;
const uploadPostMock = uploadPost as jest.Mock;
const launchImageLibraryAsyncMock = ImagePicker.launchImageLibraryAsync as jest.Mock;

describe('CreatePostModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const authState = { user: { id: '123' } };
    useAuthStoreMock.mockImplementation((selector) => (selector ? selector(authState) : authState));
  });

  it('handles image picking and post publishing', async () => {
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    });
    uploadPostMock.mockResolvedValueOnce({});

    const { getByText, getByPlaceholderText } = render(
      <CreatePostModal visible={true} onClose={onClose} />
    );

    fireEvent.press(getByText('Escolher foto'));
    await waitFor(() => expect(launchImageLibraryAsyncMock).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText('Escreva uma legenda...'), 'Test description');

    fireEvent.press(getByText('Publicar'));

    await waitFor(() => {
      expect(uploadPostMock).toHaveBeenCalledWith('123', 'test-image-uri', 'Test description');
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
