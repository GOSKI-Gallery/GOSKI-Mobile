import '../../jest.setup.js';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Post from '../../components/post';
import { usePostStore } from '../../states/usePostStore';
import { useLikeStore } from '../../states/useLikeStore';
import { useFollowStore } from '../../states/useFollowStore';
import { useAuthStore } from '../../states/useAuthStore';

jest.mock('../../states/usePostStore');
jest.mock('../../states/useLikeStore');
jest.mock('../../states/useFollowStore');
jest.mock('../../states/useAuthStore');

const usePostStoreMock = usePostStore as unknown as jest.Mock;
const useLikeStoreMock = useLikeStore as unknown as jest.Mock;
const useFollowStoreMock = useFollowStore as unknown as jest.Mock;
const useAuthStoreMock = useAuthStore as unknown as jest.Mock;

describe('Post', () => {
  const mockFetchPosts = jest.fn(() => Promise.resolve());
  const mockSetInitialLikes = jest.fn();
  const mockSetInitialFollowing = jest.fn();

  const mockPost = {
    id: '1',
    image_url: 'https://example.com/image.png',
    description: 'This is a test post',
    users: { id: 'u2', username: 'anotheruser', profile_photo_url: 'https://example.com/avatar2.png' },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const authState = { user: { id: '123' } };
    useAuthStoreMock.mockImplementation((selector) => (selector ? selector(authState) : authState));

    const likeState = {
      likes: { [mockPost.id]: false },
      likeCounts: { [mockPost.id]: 0 },
      toggleLike: jest.fn(),
      setInitialLikes: mockSetInitialLikes,
    };
    useLikeStoreMock.mockImplementation((selector) => (selector ? selector(likeState) : likeState));

    const followState = {
      following: { [mockPost.users.id]: false },
      toggleFollow: jest.fn(),
      setInitialFollowing: mockSetInitialFollowing,
    };
    useFollowStoreMock.mockImplementation((selector) => (selector ? selector(followState) : followState));
  });

  it('fetches posts and initializes likes and following on mount', async () => {
    const posts = [mockPost];
    const postState = { posts, isLoading: false, fetchPosts: mockFetchPosts };
    usePostStoreMock.mockImplementation((selector) => (selector ? selector(postState) : postState));
    (usePostStore as any).getState = jest.fn().mockReturnValue({ posts }); // Mock for subscribe

    render(<Post />);

    await waitFor(() => {
      expect(mockFetchPosts).toHaveBeenCalled();
      expect(mockSetInitialLikes).toHaveBeenCalledWith(posts, '123');
      expect(mockSetInitialFollowing).toHaveBeenCalledWith(posts, '123');
    });
  });

  it('renders PostCard with correct props', () => {
    const postState = { posts: [mockPost], isLoading: false, fetchPosts: mockFetchPosts };
    usePostStoreMock.mockImplementation((selector) => (selector ? selector(postState) : postState));

    const { getByText } = render(<Post />);

    expect(getByText('This is a test post')).toBeTruthy();
  });
});
