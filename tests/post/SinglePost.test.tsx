import '../../jest.setup.js';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SinglePost from '../../components/post/SinglePost';
import { useAuthStore } from '../../states/useAuthStore';
import { useLikeStore } from '../../states/useLikeStore';
import { useFollowStore } from '../../states/useFollowStore';
import { useRouter } from 'expo-router';

// Mock the modules
jest.mock('expo-router');
jest.mock('../../states/useAuthStore');
jest.mock('../../states/useLikeStore');
jest.mock('../../states/useFollowStore');

// Create typed mocks
const useAuthStoreMock = useAuthStore as unknown as jest.Mock;
const useLikeStoreMock = useLikeStore as unknown as jest.Mock;
const useFollowStoreMock = useFollowStore as unknown as jest.Mock;
const useRouterMock = useRouter as unknown as jest.Mock;

describe('SinglePost', () => {
  const mockPost = {
    id: '1',
    users: { id: '456', username: 'testuser', profile_photo_url: 'test-url' },
    image_url: 'test-image-url',
    description: 'Test description',
  };

  const mockPush = jest.fn();
  const mockToggleLike = jest.fn();
  const mockToggleFollow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const authState = { user: { id: '123' } };
    useAuthStoreMock.mockImplementation((selector) => (selector ? selector(authState) : authState));

    const likeState = {
      likes: { [mockPost.id]: false },
      likeCounts: { [mockPost.id]: 0 },
      toggleLike: mockToggleLike,
    };
    useLikeStoreMock.mockImplementation((selector) => (selector ? selector(likeState) : likeState));

    const followState = {
      following: { [mockPost.users.id]: false },
      toggleFollow: mockToggleFollow,
    };
    useFollowStoreMock.mockImplementation((selector) => (selector ? selector(followState) : followState));

    useRouterMock.mockReturnValue({ push: mockPush });
  });

  it('renders correctly', () => {
    const { getAllByText, getByTestId } = render(<SinglePost post={mockPost} />);
    expect(getAllByText('testuser')[0]).toBeTruthy();
    expect(getAllByText('Test description')[0]).toBeTruthy();
    expect(getByTestId('like-button')).toBeTruthy();
  });

  it('navigates to profile on press', () => {
    const { getAllByText } = render(<SinglePost post={mockPost} />);
    fireEvent.press(getAllByText('testuser')[0]);
    expect(mockPush).toHaveBeenCalledWith('/(main)/(profile)/456');
  });

  it('toggles like on press', () => {
    const { getByTestId } = render(<SinglePost post={mockPost} />);
    fireEvent.press(getByTestId('like-button'));
    expect(mockToggleLike).toHaveBeenCalledWith(mockPost.id, '123');
  });

  it('toggles follow on press', () => {
    const { getByText } = render(<SinglePost post={mockPost} />);
    fireEvent.press(getByText('Seguir'));
    expect(mockToggleFollow).toHaveBeenCalledWith(mockPost.users.id, '123');
  });
});
