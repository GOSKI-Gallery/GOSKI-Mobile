import { create } from 'zustand';

interface CreatePostModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCreatePostModalStore = create<CreatePostModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
