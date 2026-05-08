import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { useAuthStore } from '../../states/useAuthStore';
import { useEditProfileStore } from '../../states/useEditProfileStore';
import { useProfileStore } from '../../states/useProfileStore';
import uploadAvatar from '../../services/avatarService';
import * as ImagePicker from 'expo-image-picker';

const mockSupabaseEq = jest.fn().mockResolvedValue({ error: null });
const mockSupabaseUpdate = jest.fn().mockReturnValue({ eq: mockSupabaseEq });
const mockSupabaseSingle = jest.fn().mockResolvedValue({ data: {}, error: null });
const mockSupabaseSelectEq = jest.fn().mockReturnValue({ single: mockSupabaseSingle });
const mockSupabaseSelect = jest.fn().mockReturnValue({ eq: mockSupabaseSelectEq });
const mockSupabaseFrom = jest.fn().mockReturnValue({
  update: mockSupabaseUpdate,
  select: mockSupabaseSelect,
});

const mockGetSession = jest.fn().mockResolvedValue({
  data: { session: { user: { id: 'user-123' } } },
  error: null
});

jest.mock('../../services/avatarService');
jest.mock('expo-image-picker');
jest.mock('../../states/useAuthStore');
jest.mock('../../states/useEditProfileStore');
jest.mock('../../states/useProfileStore');

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockSupabaseFrom(table),
    auth: {
      getSession: () => mockGetSession(),
    },
  },
}));

describe('EditProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockRefreshUser = jest.fn().mockResolvedValue(undefined);
  const mockFetchProfileData = jest.fn().mockResolvedValue(undefined);
  const mockSetLoading = jest.fn();
  const mockReset = jest.fn();
  const mockInitialize = jest.fn();

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    profile_photo_url: 'http://example.com/photo.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        user: mockUser,
        refreshUser: mockRefreshUser,
      })
    );

    (useProfileStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        fetchProfileData: mockFetchProfileData,
      })
    );

    (useEditProfileStore as unknown as jest.Mock).mockReturnValue({
      username: 'new-username',
      email: 'new@email.com',
      password: 'new-password',
      imageUri: 'file:///new-image.jpg',
      loading: false,
      initialize: mockInitialize,
      reset: mockReset,
      setLoading: mockSetLoading,
      setUsername: jest.fn(),
      setEmail: jest.fn(),
      setPassword: jest.fn(),
      setImageUri: jest.fn(),
    });

    (uploadAvatar as jest.Mock).mockResolvedValue({ 
      profile_photo_url: 'http://example.com/new-photo.jpg' 
    });
  });

  it('should execute the complete update sequence', async () => {
    const { getByText } = render(
      <EditProfileModal visible={true} onClose={mockOnClose} />
    );

    await waitFor(() => expect(mockInitialize).toHaveBeenCalledWith(mockUser));

    fireEvent.press(getByText('Salvar alterações'));

    expect(mockSetLoading).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(uploadAvatar).toHaveBeenCalled();
      expect(mockSupabaseUpdate).toHaveBeenCalledWith(expect.objectContaining({
        username: 'new-username'
      }));
    });

    await waitFor(() => {
      expect(mockRefreshUser).toHaveBeenCalled();
      expect(mockFetchProfileData).toHaveBeenCalledWith('user-123');
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});