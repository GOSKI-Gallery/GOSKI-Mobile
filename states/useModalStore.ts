import { create } from 'zustand';

interface ModalState {
  isAnimating: boolean;
  clearAnimating: () => void;
  isCreatePostModalVisible: boolean;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;

  isEditProfileModalVisible: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;

  isNotificationModalVisible: boolean;
  setNotificationModalVisible: (visible: boolean) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isAnimating: false,
  clearAnimating: () => set({ isAnimating: false }),
  isCreatePostModalVisible: false,
  openCreatePostModal: () => {
    if (get().isAnimating) return;
    set({ isCreatePostModalVisible: true });
  },
  closeCreatePostModal: () => {
    set({ isAnimating: true, isCreatePostModalVisible: false });
  },

  isEditProfileModalVisible: false,
  openEditProfileModal: () => {
    if (get().isAnimating) return;
    set({ isEditProfileModalVisible: true });
  },
  closeEditProfileModal: () => {
    set({ isAnimating: true, isEditProfileModalVisible: false });
  },

  isNotificationModalVisible: false,
  setNotificationModalVisible: (visible) => {
    if (visible && get().isAnimating) return;
    set({ isNotificationModalVisible: visible, isAnimating: visible });
  },
}));
