jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(),
    },
    from: jest.fn(),
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
  ensureProfile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64-encoded-image'),
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn().mockReturnValue(new ArrayBuffer(8)),
}));

import uploadPost from '../../services/postService';
import { supabase } from '../../lib/supabase';

describe('uploadPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/test.jpg' } }),
    });

    const chain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    (supabase.from as jest.Mock).mockReturnValue(chain);
  });

  it('uploads a post successfully', async () => {
    const mockPost = { id: 1, user_id: 'user-123', image_url: 'https://cdn.example.com/test.jpg', description: 'my post' };
    (supabase.from as jest.Mock)().single.mockResolvedValue({ data: mockPost, error: null });

    const result = await uploadPost('user-123', 'file://photo.jpg', 'my post');

    expect(result).toEqual(mockPost);
    expect(supabase.from).toHaveBeenCalledWith('posts');
    expect(supabase.functions.invoke).toHaveBeenCalledWith('image-moderator', {
      body: { record: { id: mockPost.id, image_url: mockPost.image_url } },
    });
  });

  it('throws on storage error', async () => {
    (supabase.storage.from as jest.Mock)().upload.mockResolvedValue({ data: null, error: new Error('Upload failed') });

    await expect(uploadPost('user-123', 'file://photo.jpg', 'desc')).rejects.toThrow('Upload failed');
  });

  it('throws on insert error', async () => {
    (supabase.from as jest.Mock)().single.mockResolvedValue({ data: null, error: new Error('Insert failed') });

    await expect(uploadPost('user-123', 'file://photo.jpg', 'desc')).rejects.toThrow('Insert failed');
  });
});
