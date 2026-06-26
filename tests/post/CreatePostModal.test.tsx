import '../../jest.setup.js';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePostModal from '../../components/post/CreatePostModal';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../states/useAuthStore';
import { useModalStore } from '../../states/useModalStore';
import uploadPost from '../../services/postService';

jest.mock('expo-image-picker');
jest.mock('../../services/postService');
jest.mock('../../states/useAuthStore');
jest.mock('../../states/useModalStore');
jest.mock('../../components/ui/ImageCropper', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => {
      React.useEffect(() => {
        if (props.visible && props.imageUri) {
          props.onCrop(props.imageUri);
        }
      }, [props.visible, props.imageUri]);
      return null;
    },
  };
});

const useAuthStoreMock = useAuthStore as unknown as jest.Mock;
const useModalStoreMock = useModalStore as unknown as jest.Mock;
const uploadPostMock = uploadPost as jest.Mock;
const launchImageLibraryAsyncMock = ImagePicker.launchImageLibraryAsync as jest.Mock;

describe('CreatePostModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const authState = { user: { id: '123', username: 'test', profile_photo_url: '' } };
    useAuthStoreMock.mockImplementation((selector) => (selector ? selector(authState) : authState));

    useModalStoreMock.mockReturnValue({
      isCreatePostModalVisible: true,
      closeCreatePostModal: jest.fn(),
    });
  });

  it('handles image picking and post publishing', async () => {
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    });
    uploadPostMock.mockResolvedValueOnce({ id: 'post1' });

    const { getByText, getByPlaceholderText } = render(<CreatePostModal />);

    fireEvent.press(getByText('Escolher foto'));
    await waitFor(() => expect(launchImageLibraryAsyncMock).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText('Escreva uma legenda...'), 'Test description');

    fireEvent.press(getByText('Publicar'));

    await waitFor(() => {
      expect(uploadPostMock).toHaveBeenCalledWith('123', 'test-image-uri', 'Test description');
    });
  });
});
