
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Profile from '../../components/profile';
import { useProfileStore } from '../../states/useProfileStore';
import { useFollowStore } from '../../states/useFollowStore';
import { useAuthStore } from '../../states/useAuthStore';
import { useFocusEffect } from 'expo-router';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../../states/useProfileStore');
jest.mock('../../states/useFollowStore');
jest.mock('../../states/useAuthStore');

describe('Profile', () => {
  const mockFetchProfileData = jest.fn();
  const mockClearProfile = jest.fn();
  const mockToggleFollow = jest.fn();
  const currentUserId = 'current-user-id';

  beforeEach(() => {
    jest.clearAllMocks();

    (useFocusEffect as jest.Mock).mockImplementation(callback => {
      React.useEffect(() => {
        const cleanup = callback();
        return cleanup;
      }, []);
    });

    (useAuthStore as unknown as jest.Mock).mockImplementation(selector => {
      const state = {
        user: { id: currentUserId },
      };
      return selector(state);
    });

    (useFollowStore as unknown as jest.Mock).mockReturnValue({
      following: {},
      toggleFollow: mockToggleFollow,
    });
  });

  it('should display a loading indicator while fetching data', () => {
    (useProfileStore as unknown as jest.Mock).mockReturnValue({
      isLoading: true,
      fetchProfileData: mockFetchProfileData,
      clearProfile: mockClearProfile,
    });

    const { getByTestId } = render(
      <Profile userId="test-user-id" isOwnProfile={false} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  describe('when profile data is loaded', () => {
    const mockProfileUser = {
      id: 'test-user-id',
      username: 'testuser',
      profile_photo_url: 'https://example.com/photo.jpg',
    };

    beforeEach(() => {
      (useProfileStore as unknown as jest.Mock).mockReturnValue({
        isLoading: false,
        fetchProfileData: mockFetchProfileData,
        clearProfile: mockClearProfile,
        profileUser: mockProfileUser,
        userPosts: [],
        followersCount: 10,
        followingCount: 5,
      });
    });

    it('should display the user profile information', async () => {
      const { findByText } = render(
        <Profile userId="test-user-id" isOwnProfile={false} />
      );

      expect(await findByText('testuser')).toBeTruthy();
      expect(await findByText('10')).toBeTruthy();
      expect(await findByText('5')).toBeTruthy();
    });

    describe('on another user\'s profile', () => {
      it('should call toggleFollow when the follow button is pressed', () => {
        const { getByText } = render(
          <Profile userId="test-user-id" isOwnProfile={false} />
        );

        fireEvent.press(getByText('Seguir'));

        expect(mockToggleFollow).toHaveBeenCalledWith('test-user-id', currentUserId);
      });
    });

    describe('on the user\'s own profile', () => {
      it('should display the edit profile button', () => {
        const { getByText } = render(
          <Profile userId="test-user-id" isOwnProfile={true} />
        );

        expect(getByText('Editar perfil')).toBeTruthy();
      });
    });
  });
});
