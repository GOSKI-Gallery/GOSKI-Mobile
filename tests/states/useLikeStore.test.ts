import { useLikeStore } from '../../states/useLikeStore';
import { supabase } from '../../lib/supabase';
import { Alert } from 'react-native';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');

describe('useLikeStore', () => {
  const mockInsert = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useLikeStore.setState({ likes: {}, likeCounts: {} });

    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert.mockReturnThis(),
      delete: mockDelete.mockReturnThis(),
      match: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  it('initializes likes and counts from posts', () => {
    const posts = [
      { id: 1, likes: [{ user_id: 'user1' }, { user_id: 'user2' }] },
      { id: 2, likes: [{ user_id: 'user2' }] },
    ];

    useLikeStore.getState().setInitialLikes(posts, 'user1');

    const state = useLikeStore.getState();
    expect(state.likes[1]).toBe(true);
    expect(state.likes[2]).toBe(false);
    expect(state.likeCounts[1]).toBe(2);
    expect(state.likeCounts[2]).toBe(1);
  });

  it('toggles like optimistically and persists', async () => {
    useLikeStore.setState({
      likes: { 1: false },
      likeCounts: { 1: 0 },
    });

    mockInsert.mockResolvedValue({ error: null });

    await useLikeStore.getState().toggleLike(1, 'user1');

    expect(useLikeStore.getState().likes[1]).toBe(true);
    expect(useLikeStore.getState().likeCounts[1]).toBe(1);
    expect(supabase.from).toHaveBeenCalledWith('likes');
  });

  it('reverts on error', async () => {
    useLikeStore.setState({
      likes: { 1: false },
      likeCounts: { 1: 0 },
    });

    mockInsert.mockResolvedValue({ error: new Error('DB error') });

    await useLikeStore.getState().toggleLike(1, 'user1');

    expect(useLikeStore.getState().likes[1]).toBe(false);
    expect(useLikeStore.getState().likeCounts[1]).toBe(0);
  });

  it('alerts when not logged in', async () => {
    await useLikeStore.getState().toggleLike(1, undefined);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro',
      'Você precisa estar logado para curtir.'
    );
  });
});
