
import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  isNotificationModalVisible: boolean;
  setNotificationModalVisible: (visible: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  isNotificationModalVisible: false,
  setNotificationModalVisible: (visible) => set({ isNotificationModalVisible: visible }),
}));
