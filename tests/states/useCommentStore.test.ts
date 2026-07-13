import { useCommentStore } from '../../states/useCommentStore';
import { supabase } from '../../lib/supabase';
import { Alert } from 'react-native';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  ensureProfile: jest.fn().mockResolvedValue(undefined),
}));

jest.spyOn(Alert, 'alert');

describe('useCommentStore', () => {
  const mockUsers = [
    { id: 'user1', username: 'carlos', profile_photo_url: null },
    { id: 'user2', username: 'maria', profile_photo_url: 'https://example.com/photo.jpg' },
  ];

  const mockComments = [
    { id: 1, post_id: 1, user_id: 'user1', body: 'Nice post!', created_at: '2026-01-01T00:00:00Z' },
    { id: 2, post_id: 1, user_id: 'user2', body: 'Thanks!', created_at: '2026-01-01T00:01:00Z' },
  ];

  const mockCommentWithUsers = mockComments.map((c) => ({
    ...c,
    users: mockUsers.find((u) => u.id === c.user_id)!,
  }));

  const mockInsert = jest.fn();
  const mockDelete = jest.fn();
  const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });

  beforeEach(() => {
    jest.clearAllMocks();
    useCommentStore.setState({ comments: {}, commentCounts: {} });
    mockSingle.mockResolvedValue({ data: null, error: null });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'comments') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          insert: mockInsert.mockReturnThis(),
          delete: mockDelete.mockReturnThis(),
          match: jest.fn().mockReturnThis(),
          single: mockSingle,
        };
      }
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
        };
      }
      return {};
    });
  });

  describe('fetchComments', () => {
    it('fetches comments with user data', async () => {
      const eqMock = jest.fn().mockReturnThis();
      const orderMock = jest.fn().mockResolvedValue({ data: mockComments, error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'comments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: eqMock,
            order: orderMock,
          };
        }
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
          };
        }
        return {};
      });

      await useCommentStore.getState().fetchComments(1);

      const state = useCommentStore.getState();
      expect(state.comments['1']).toHaveLength(2);
      expect(state.comments['1'][0].users.username).toBe('carlos');
      expect(state.comments['1'][1].users.username).toBe('maria');
      expect(state.commentCounts['1']).toBe(2);
    });

    it('handles empty comments', async () => {
      const eqMock = jest.fn().mockReturnThis();
      const orderMock = jest.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'comments') {
          return { select: jest.fn().mockReturnThis(), eq: eqMock, order: orderMock };
        }
        return {};
      });

      await useCommentStore.getState().fetchComments(1);

      const state = useCommentStore.getState();
      expect(state.comments['1']).toEqual([]);
      expect(state.commentCounts['1']).toBe(0);
    });
  });

  describe('addComment', () => {
    it('adds a comment and updates count', async () => {
      const newComment = { id: 99, post_id: 1, user_id: 'user1', body: 'Great!', created_at: '2026-01-02T00:00:00Z' };
      mockSingle.mockResolvedValue({ data: newComment, error: null });

      await useCommentStore.getState().addComment(1, 'user1', 'Great!', [{ id: 'user1', username: 'carlos', profile_photo_url: null }]);

      const state = useCommentStore.getState();
      expect(state.comments['1']).toHaveLength(1);
      expect(state.comments['1'][0].body).toBe('Great!');
      expect(state.comments['1'][0].users.username).toBe('carlos');
      expect(state.commentCounts['1']).toBe(1);
    });

    it('shows alert and does not add on auth error', async () => {
      useCommentStore.getState().addComment(1, undefined as any, 'fail', []);

      expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Você precisa estar logado para comentar.');
      const state = useCommentStore.getState();
      expect(state.comments['1']).toBeUndefined();
    });
  });

  describe('deleteComment', () => {
    it('deletes a comment optimistically', async () => {
      useCommentStore.setState({
        comments: { 1: mockCommentWithUsers },
        commentCounts: { 1: 2 },
      });

      const matchMock = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'comments') {
          return {
            delete: jest.fn().mockReturnThis(),
            match: matchMock,
          };
        }
        return {};
      });

      await useCommentStore.getState().deleteComment(1, 1);

      const state = useCommentStore.getState();
      expect(state.comments['1']).toHaveLength(1);
      expect(state.commentCounts['1']).toBe(1);
      expect(supabase.from).toHaveBeenCalledWith('comments');
    });

    it('reverts delete on error', async () => {
      useCommentStore.setState({
        comments: { 1: mockCommentWithUsers },
        commentCounts: { 1: 2 },
      });

      const matchMock = jest.fn().mockResolvedValue({ error: new Error('DB error') });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'comments') {
          return {
            delete: jest.fn().mockReturnThis(),
            match: matchMock,
          };
        }
        return {};
      });

      await useCommentStore.getState().deleteComment(1, 1);

      const state = useCommentStore.getState();
      expect(state.comments['1']).toHaveLength(2);
      expect(state.commentCounts['1']).toBe(2);
    });
  });
});
