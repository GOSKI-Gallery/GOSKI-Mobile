import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CommentSection from '../../components/post/CommentSection';
import { useCommentStore } from '../../states/useCommentStore';
import { useAuthStore } from '../../states/useAuthStore';
import { useThemeStore } from '../../states/useThemeStore';

const mockCommentsData = [
  {
    id: 1,
    post_id: 1,
    user_id: 'user1',
    body: 'Nice post!',
    created_at: new Date().toISOString(),
    users: { id: 'user1', username: 'carlos', profile_photo_url: null },
  },
  {
    id: 2,
    post_id: 1,
    user_id: 'user2',
    body: 'Great photo!',
    created_at: new Date().toISOString(),
    users: { id: 'user2', username: 'maria', profile_photo_url: 'https://example.com/photo.jpg' },
  },
];

jest.mock('../../states/useCommentStore', () => ({
  useCommentStore: jest.fn(),
}));

jest.mock('../../states/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../states/useThemeStore', () => ({
  useThemeStore: jest.fn(),
}));

jest.mock('../../lib/time', () => ({
  timeAgo: jest.fn(() => '1m atrás'),
}));

describe('CommentSection', () => {
  const onClose = jest.fn();
  const mockAddComment = jest.fn().mockResolvedValue(undefined);
  const mockFetchComments = jest.fn().mockResolvedValue(undefined);
  const mockDeleteComment = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();

    (useCommentStore as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        comments: { 1: mockCommentsData },
        commentCounts: { 1: 2 },
        fetchComments: mockFetchComments,
        addComment: mockAddComment,
        deleteComment: mockDeleteComment,
      };
      return selector ? selector(state) : state;
    });

    (useAuthStore as jest.Mock).mockReturnValue({ user: { id: 'user1', username: 'carlos' } });

    (useThemeStore as jest.Mock).mockImplementation((selector: any) => selector({ isDark: false }));
  });

  it('renders comments list when expanded', async () => {
    const { getByText, getAllByText, getByTestId } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    expect(getByTestId('comment-section')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Nice post!')).toBeTruthy();
      expect(getByText('Great photo!')).toBeTruthy();
      expect(getByText('carlos')).toBeTruthy();
      expect(getByText('maria')).toBeTruthy();
    });
    expect(getAllByText('1m atrás').length).toBe(2);
  });

  it('renders comment section when expanded', () => {
    const { getByTestId } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    expect(getByTestId('comment-section')).toBeTruthy();
  });

  it('shows delete button for own comments and post owner', async () => {
    const { queryByTestId } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    await waitFor(() => {
      expect(queryByTestId('delete-comment-1')).toBeTruthy();
      expect(queryByTestId('delete-comment-2')).toBeTruthy();
    });
  });

  it('calls addComment when send button is pressed', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    fireEvent.changeText(getByPlaceholderText('Escreva um comentário...'), 'New comment!');
    fireEvent.press(getByTestId('send-comment'));

    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith(1, 'user1', 'New comment!', expect.any(Array));
    });
  });

  it('does not send empty comments', () => {
    const { getByTestId } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    fireEvent.press(getByTestId('send-comment'));

    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('shows loading indicator while fetching comments', () => {
    (useCommentStore as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        comments: {},
        commentCounts: {},
        fetchComments: mockFetchComments,
        addComment: mockAddComment,
        deleteComment: mockDeleteComment,
      };
      return selector ? selector(state) : state;
    });

    const { getByText } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('shows error state when fetch fails', async () => {
    const mockFailedFetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    (useCommentStore as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        comments: {},
        commentCounts: {},
        fetchComments: mockFailedFetch,
        addComment: mockAddComment,
        deleteComment: mockDeleteComment,
      };
      return selector ? selector(state) : state;
    });

    const { getByText, findByText } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    expect(await findByText('Erro ao carregar comentários.')).toBeTruthy();
  });

  it('shows empty state when there are no comments', async () => {
    (useCommentStore as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        comments: { 1: [] },
        commentCounts: { 1: 0 },
        fetchComments: mockFetchComments,
        addComment: mockAddComment,
        deleteComment: mockDeleteComment,
      };
      return selector ? selector(state) : state;
    });

    const { getByText } = render(
      <CommentSection expanded postId={1} postUserId="user1" onClose={onClose} />
    );

    await waitFor(() => {
      expect(getByText('Nenhum comentário ainda. Seja o primeiro!')).toBeTruthy();
    });
  });

});
