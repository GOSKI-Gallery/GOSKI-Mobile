import { create } from 'zustand';

interface EditProfileState {
    username: string;
    email: string;
    password: string;
    profilePhotoUrl: string | null;
    imageUri: string | null;
    loading: boolean;
    setUsername: (username: string) => void;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setProfilePhotoUrl: (url: string | null) => void;
    setImageUri: (uri: string | null) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
    initialize: (user: any) => void;
}

export const useEditProfileStore = create<EditProfileState>((set) => ({
    username: '',
    email: '',
    password: '',
    profilePhotoUrl: null,
    imageUri: null,
    loading: false,

    setUsername: (username) => set({ username }),
    setEmail: (email) => set({ email }),
    setPassword: (password) => set({ password }),
    setProfilePhotoUrl: (url) => set({ profilePhotoUrl: url }),
    setImageUri: (uri) => set({ imageUri: uri }),
    setLoading: (loading) => set({ loading }),

    reset: () => set({
        username: '',
        email: '',
        password: '',
        profilePhotoUrl: null,
        imageUri: null,
        loading: false,
    }),

    initialize: (user) => set({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        profilePhotoUrl: user?.profile_photo_url || null,
        imageUri: null,
        loading: false,
    }),
}));