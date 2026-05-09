import { create } from 'zustand';

interface ModalState {
  isCreatePostModalVisible: boolean;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;

  isEditProfileModalVisible: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;

  isNotificationModalVisible: boolean;
  setNotificationModalVisible: (visible: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isCreatePostModalVisible: false,
  openCreatePostModal: () => set({ isCreatePostModalVisible: true }),
  closeCreatePostModal: () => set({ isCreatePostModalVisible: false }),

  isEditProfileModalVisible: false,
  openEditProfileModal: () => set({ isEditProfileModalVisible: true }),
  closeEditProfileModal: () => set({ isEditProfileModalVisible: false }),

  isNotificationModalVisible: false,
  setNotificationModalVisible: (visible) => set({ isNotificationModalVisible: visible }),
}));
