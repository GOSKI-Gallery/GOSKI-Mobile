import { useFollowStore } from '../../states/useFollowStore';
import { supabase } from '../../lib/supabase';
import { Alert } from 'react-native';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  ensureProfile: jest.fn().mockResolvedValue(undefined),
}));

jest.spyOn(Alert, 'alert');

describe('useFollowStore', () => {
  let chain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    useFollowStore.setState({ following: {} });

    chain = {
      insert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn(() => chain),
      match: jest.fn().mockResolvedValue({ error: null }),
    };

    (supabase.from as jest.Mock).mockReturnValue(chain);
  });

  it('starts with empty following', () => {
    expect(useFollowStore.getState().following).toEqual({});
  });

  it('sets initial following from posts', () => {
    const posts = [
      { users: { id: 'u1', followers: [{ follower_id: 'me' }] } },
      { users: { id: 'u2', followers: [{ follower_id: 'other' }] } },
    ];

    useFollowStore.getState().setInitialFollowing(posts, 'me');

    expect(useFollowStore.getState().following).toEqual({ u1: true, u2: false });
  });

  it('does nothing when setInitialFollowing is called without userId', () => {
    useFollowStore.getState().setInitialFollowing([], undefined);
    expect(useFollowStore.getState().following).toEqual({});
  });

  it('toggles follow optimistically and persists', async () => {
    const result = await useFollowStore.getState().toggleFollow('target', 'me');

    expect(result).toBe(true);
    expect(useFollowStore.getState().following.target).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('follows');
  });

  it('toggles unfollow optimistically and persists', async () => {
    useFollowStore.setState({ following: { target: true } });

    chain.delete = jest.fn(() => chain);
    chain.match = jest.fn().mockResolvedValue({ error: null });

    const result = await useFollowStore.getState().toggleFollow('target', 'me');

    expect(result).toBe(false);
    expect(useFollowStore.getState().following.target).toBe(false);
  });

  it('reverts on error', async () => {
    useFollowStore.setState({ following: { target: false } });
    chain.insert.mockResolvedValue({ error: new Error('DB error') });

    const result = await useFollowStore.getState().toggleFollow('target', 'me');

    expect(result).toBe(false);
    expect(useFollowStore.getState().following.target).toBe(false);
  });

  it('alerts when not logged in', async () => {
    const result = await useFollowStore.getState().toggleFollow('target', undefined);

    expect(result).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Você precisa estar logado para seguir.');
  });

  it('sets following state directly', () => {
    useFollowStore.getState().setFollowingState('u1', true);
    expect(useFollowStore.getState().following.u1).toBe(true);
  });
});
