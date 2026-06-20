jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: { from: jest.fn() },
    from: jest.fn(),
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64-avatar'),
}));

jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn().mockReturnValue(new ArrayBuffer(8)),
}));

import uploadAvatar from '../../services/avatarService';
import { supabase } from '../../lib/supabase';

const mockStorageFrom = {
  upload: jest.fn(),
  getPublicUrl: jest.fn(),
};

function buildFromChain() {
  return {
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
  };
}

describe('uploadAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockStorageFrom.upload.mockResolvedValue({ data: { path: 'avatar.jpg' }, error: null });
    mockStorageFrom.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/avatar.jpg' } });
    (supabase.storage.from as jest.Mock).mockReturnValue(mockStorageFrom);

    (supabase.from as jest.Mock).mockReturnValue(buildFromChain());
  });

  it('uploads avatar successfully', async () => {
    const mockUser = { id: 'user-123', profile_photo_url: 'https://cdn.example.com/avatar.jpg' };
    (supabase.from as jest.Mock)().maybeSingle.mockResolvedValue({ data: mockUser, error: null });

    const result = await uploadAvatar('user-123', 'file://photo.jpg');

    expect(result).toEqual(mockUser);
    expect(supabase.from).toHaveBeenCalledWith('users');
  });

  it('throws on storage error', async () => {
    mockStorageFrom.upload.mockResolvedValue({ data: null, error: new Error('Storage failed') });

    await expect(uploadAvatar('user-123', 'file://photo.jpg')).rejects.toThrow('Storage failed');
  });

  it('throws on update error', async () => {
    (supabase.from as jest.Mock)().maybeSingle.mockResolvedValue({ data: null, error: new Error('Update failed') });

    await expect(uploadAvatar('user-123', 'file://photo.jpg')).rejects.toThrow('Update failed');
  });
});
