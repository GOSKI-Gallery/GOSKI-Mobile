import { useProfileStore } from '../../states/useProfileStore';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockAuthUser = { user: { id: 'current-user' } };
jest.mock('../../states/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (selector: any) => selector(mockAuthUser),
    { getState: () => mockAuthUser },
  ),
}));

function makeChain(finalResult?: any) {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.in = jest.fn(() => chain);
  chain.or = jest.fn(() => chain);
  chain.order = jest.fn(() => chain);
  chain.maybeSingle = jest.fn(() => chain);
  chain._result = finalResult;
  chain.then = (resolve: any, _reject?: any) =>
    Promise.resolve(chain._result).then(resolve);
  chain.catch = (reject: any) =>
    Promise.resolve(chain._result).catch(reject);
  return chain;
}

describe('useProfileStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.setState({ profileUser: null, userPosts: [], followersCount: 0, followingCount: 0, isLoading: false });
  });

  it('starts with default state', () => {
    const s = useProfileStore.getState();
    expect(s.profileUser).toBeNull();
    expect(s.userPosts).toEqual([]);
    expect(s.isLoading).toBe(false);
  });

  it('fetches profile data successfully', async () => {
    let callIdx = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callIdx++;
      switch (callIdx) {
        case 1:
          return makeChain({ data: { id: 'u1', username: 'user1', email: 'a@b.com' }, error: null });
        case 2:
          return makeChain({ data: [{ id: 1, user_id: 'u1', image_url: 'img.jpg' }], error: null });
        case 3:
          return makeChain({ count: 5, error: null });
        case 4:
          return makeChain({ count: 3, error: null });
        case 5: {
          const c = makeChain({ data: [{ follower_id: 'current-user', followed_id: 'u1' }], error: null });
          c.eq = jest.fn(() => c);
          return c;
        }
        default:
          return makeChain({ data: null, error: null });
      }
    });

    const isFollowing = await useProfileStore.getState().fetchProfileData('u1');

    expect(isFollowing).toBe(true);
    const s = useProfileStore.getState();
    expect(s.profileUser).toEqual({ id: 'u1', username: 'user1', email: 'a@b.com' });
    expect(s.userPosts).toHaveLength(1);
    expect(s.followersCount).toBe(5);
    expect(s.followingCount).toBe(3);
  });

  it('handles fetch error gracefully', async () => {
    (supabase.from as jest.Mock).mockReturnValue(makeChain({ data: null, error: new Error('not found') }));

    const isFollowing = await useProfileStore.getState().fetchProfileData('u1');

    expect(isFollowing).toBe(false);
    expect(useProfileStore.getState().isLoading).toBe(false);
  });

  it('increments and decrements followers', () => {
    useProfileStore.getState().incrementFollowers();
    expect(useProfileStore.getState().followersCount).toBe(1);
    useProfileStore.getState().decrementFollowers();
    expect(useProfileStore.getState().followersCount).toBe(0);
  });

  it('clears profile', () => {
    useProfileStore.setState({ profileUser: { id: 'u1' }, userPosts: [{ id: 1 }] });
    useProfileStore.getState().clearProfile();
    const s = useProfileStore.getState();
    expect(s.profileUser).toBeNull();
    expect(s.userPosts).toEqual([]);
  });
});
