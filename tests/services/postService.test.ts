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
  let insertMock: jest.Mock;

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
    insertMock = chain.insert;
    (supabase.from as jest.Mock).mockReturnValue(chain);
  });

  it('uploads a post successfully without location and without moderation fields', async () => {
    const mockPost = { id: 1, user_id: 'user-123', image_url: 'https://cdn.example.com/test.jpg', description: 'my post' };
    (supabase.from as jest.Mock)().single.mockResolvedValue({ data: mockPost, error: null });

    const result = await uploadPost('user-123', 'file://photo.jpg', 'my post');

    expect(result).toEqual(mockPost);
    expect(supabase.from).toHaveBeenCalledWith('posts');

    const insertPayload = insertMock.mock.calls[0][0];
    expect(insertPayload).not.toHaveProperty('moderation_status');
    expect(insertPayload).not.toHaveProperty('is_nsfw');
    expect(insertPayload).not.toHaveProperty('latitude');
    expect(insertPayload).not.toHaveProperty('longitude');
    expect(insertPayload).not.toHaveProperty('location_name');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('includes location fields when a location is provided', async () => {
    const mockPost = { id: 1, user_id: 'user-123', image_url: 'https://cdn.example.com/test.jpg', latitude: -14.8871, longitude: -47.8071, location_name: 'Alto Paraíso de Goiás, Goiás, Brazil' };
    (supabase.from as jest.Mock)().single.mockResolvedValue({ data: mockPost, error: null });

    const location = {
      latitude: -14.8871,
      longitude: -47.8071,
      location_name: 'Alto Paraíso de Goiás, Goiás, Brazil',
    };
    const result = await uploadPost('user-123', 'file://photo.jpg', 'my post', location);

    expect(result).toEqual(mockPost);
    const insertPayload = insertMock.mock.calls[0][0];
    expect(insertPayload.latitude).toBe(-14.8871);
    expect(insertPayload.longitude).toBe(-47.8071);
    expect(insertPayload.location_name).toBe('Alto Paraíso de Goiás, Goiás, Brazil');
  });

  it('sends coordinates only when location name is missing', async () => {
    const mockPost = { id: 1, user_id: 'user-123', latitude: 1.0, longitude: 2.0 };
    (supabase.from as jest.Mock)().single.mockResolvedValue({ data: mockPost, error: null });

    await uploadPost('user-123', 'file://photo.jpg', 'my post', { latitude: 1.0, longitude: 2.0 });

    const insertPayload = insertMock.mock.calls[0][0];
    expect(insertPayload.latitude).toBe(1.0);
    expect(insertPayload.longitude).toBe(2.0);
    expect(insertPayload.location_name).toBeUndefined();
  });

  it('does not invoke image-moderator after insert (webhook handles moderation)', async () => {
    const mockPost = { id: 1, user_id: 'user-123', image_url: 'https://cdn.example.com/test.jpg' };
    (supabase.from as jest.Mock)().single.mockResolvedValue({ data: mockPost, error: null });

    await uploadPost('user-123', 'file://photo.jpg', 'my post');

    expect(supabase.functions.invoke).not.toHaveBeenCalled();
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