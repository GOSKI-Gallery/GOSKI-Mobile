import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { useEditProfileStore } from '../../states/useEditProfileStore';
import { useAuthStore } from '../../states/useAuthStore';

import uploadAvatar from '../../services/avatarService';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));
jest.mock('../../services/avatarService');
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'user-123', username: 'testuser' }, error: null }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ error: null }),
          })),
        })),
      })),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-123' } } } }),
    },
  },
}));
jest.mock('../../states/useEditProfileStore');
jest.mock('../../states/useAuthStore');

describe('EditProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockInitialize = jest.fn();
  const mockReset = jest.fn();
  const mockSetLoading = jest.fn();

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    profile_photo_url: 'http://example.com/photo.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockImplementation(selector => {
      const state = { user: mockUser };
      return selector(state);
    });

    (uploadAvatar as jest.Mock).mockResolvedValue('http://example.com/new-photo.jpg');
  });

  it('should handle saving changes with a new image', async () => {
    (useEditProfileStore as unknown as jest.Mock).mockReturnValue({
      username: 'new-username',
      email: mockUser.email,
      password: '',
      imageUri: 'file:///new-image.jpg',
      loading: false,
      setLoading: mockSetLoading,
      reset: mockReset,
      initialize: mockInitialize,
    });

    const { getByText } = render(
      <EditProfileModal visible={true} onClose={mockOnClose} />
    );

    await act(async () => {
      fireEvent.press(getByText('Salvar alterações'));
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(uploadAvatar).toHaveBeenCalledWith(mockUser.id, 'file:///new-image.jpg');
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
  });
});
