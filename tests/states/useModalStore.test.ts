import { useModalStore } from '../../states/useModalStore';

describe('useModalStore', () => {
  beforeEach(() => {
    useModalStore.setState({
      isAnimating: false,
      isCreatePostModalVisible: false,
      isEditProfileModalVisible: false,
      isNotificationModalVisible: false,
    });
  });

  it('starts with all modals closed', () => {
    const state = useModalStore.getState();
    expect(state.isCreatePostModalVisible).toBe(false);
    expect(state.isEditProfileModalVisible).toBe(false);
    expect(state.isNotificationModalVisible).toBe(false);
  });

  it('opens and closes create post modal', () => {
    const { openCreatePostModal, closeCreatePostModal } = useModalStore.getState();

    openCreatePostModal();
    expect(useModalStore.getState().isCreatePostModalVisible).toBe(true);

    closeCreatePostModal();
    expect(useModalStore.getState().isCreatePostModalVisible).toBe(false);
  });

  it('opens and closes edit profile modal', () => {
    const { openEditProfileModal, closeEditProfileModal } = useModalStore.getState();

    openEditProfileModal();
    expect(useModalStore.getState().isEditProfileModalVisible).toBe(true);

    closeEditProfileModal();
    expect(useModalStore.getState().isEditProfileModalVisible).toBe(false);
  });

  it('sets notification modal visibility', () => {
    const { setNotificationModalVisible } = useModalStore.getState();

    setNotificationModalVisible(true);
    expect(useModalStore.getState().isNotificationModalVisible).toBe(true);

    setNotificationModalVisible(false);
    expect(useModalStore.getState().isNotificationModalVisible).toBe(false);
  });

  it('blocks opening modals while animating', () => {
    const { openCreatePostModal, openEditProfileModal, setNotificationModalVisible } = useModalStore.getState();

    useModalStore.setState({ isAnimating: true });
    expect(useModalStore.getState().isAnimating).toBe(true);

    openCreatePostModal();
    expect(useModalStore.getState().isCreatePostModalVisible).toBe(false);

    openEditProfileModal();
    expect(useModalStore.getState().isEditProfileModalVisible).toBe(false);

    setNotificationModalVisible(true);
    expect(useModalStore.getState().isNotificationModalVisible).toBe(false);
  });

  it('allows opening modals when not animating', () => {
    const { openCreatePostModal } = useModalStore.getState();
    useModalStore.setState({ isAnimating: false });
    openCreatePostModal();
    expect(useModalStore.getState().isCreatePostModalVisible).toBe(true);
  });

  it('clears isAnimating', () => {
    const { clearAnimating } = useModalStore.getState();
    useModalStore.setState({ isAnimating: true });
    clearAnimating();
    expect(useModalStore.getState().isAnimating).toBe(false);
  });
});
