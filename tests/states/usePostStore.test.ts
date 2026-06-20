import { usePostStore } from '../../states/usePostStore';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  ensureProfile: jest.fn(),
}));

jest.mock('../../states/useAuthStore', () => ({
  useAuthStore: Object.assign(
    (selector: any) => selector({ user: { id: 'me' } }),
    { getState: () => ({ user: { id: 'me' } }) },
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

describe('usePostStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePostStore.setState({ posts: [], isLoading: false });
  });

  it('starts with empty posts', () => {
    expect(usePostStore.getState().posts).toEqual([]);
    expect(usePostStore.getState().isLoading).toBe(false);
  });

  it('adds a post optimistically', () => {
    const newPost = { id: 99, description: 'new' };
    usePostStore.getState().addPostOptimistic(newPost);
    expect(usePostStore.getState().posts).toEqual([newPost]);
  });

  it('handles empty data from fetchPosts', async () => {
    (supabase.from as jest.Mock).mockReturnValue(makeChain({ data: [], error: null }));

    await usePostStore.getState().fetchPosts();

    expect(usePostStore.getState().posts).toEqual([]);
    expect(usePostStore.getState().isLoading).toBe(false);
  });

  it('handles error from fetchPosts', async () => {
    (supabase.from as jest.Mock).mockReturnValue(makeChain({ data: null, error: { message: 'DB error' } }));

    await usePostStore.getState().fetchPosts();

    expect(usePostStore.getState().posts).toEqual([]);
  });

  it('fetches posts with related data', async () => {
    const mockPosts = [
      {
        id: 1, user_id: 'u1', description: 'post1', image_url: 'img.jpg',
        moderation_status: 'UNKNOWN', created_at: '2024-01-01', is_nsfw: false,
      },
    ];

    let callIdx = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      callIdx++;
      switch (callIdx) {
        case 1: return makeChain({ data: mockPosts, error: null });
        case 2: return makeChain({ data: [{ id: 'u1', username: 'user1', profile_photo_url: null }], error: null });
        case 3: return makeChain({ data: [{ post_id: 1, user_id: 'u2' }], error: null });
        case 4: return makeChain({ data: [{ follower_id: 'me', followed_id: 'u1' }], error: null });
        case 5: return makeChain({ data: [{ follower_id: 'u2', followed_id: 'u1' }], error: null });
        case 6: return makeChain({ data: [{ post_id: 1 }], error: null });
        case 7: return makeChain({ data: [{ tag_id: 10 }], error: null });
        case 8: return makeChain({ data: [{ post_id: 1, tag_id: 10 }], error: null });
        default: return makeChain({ data: null, error: null });
      }
    });

    await usePostStore.getState().fetchPosts();

    const posts = usePostStore.getState().posts;
    expect(posts.length).toBe(1);
    expect(posts[0].users.username).toBe('user1');
    expect(posts[0].likes).toEqual([{ user_id: 'u2' }]);
    expect(posts[0].post_tag).toEqual([{ post_id: 1, tag_id: 10 }]);
  });
});
