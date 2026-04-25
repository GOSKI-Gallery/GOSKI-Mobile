
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ActionButtons from '../../components/header/ActionButtons';
import { useModalStore } from '../../states/useModalStore';

jest.mock('../../states/useModalStore');

describe('ActionButtons', () => {
  const mockOpen = jest.fn();
  const mockSetNotificationModalVisible = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useModalStore as unknown as jest.Mock).mockReturnValue({
      open: mockOpen,
      setNotificationModalVisible: mockSetNotificationModalVisible,
    });
  });

  it('should render both the add post and notification buttons', () => {
    const { getByTestId } = render(<ActionButtons />);

    expect(getByTestId('add-post-icon')).toBeTruthy();
    expect(getByTestId('notification-bell-icon')).toBeTruthy();
  });

  it('should call the "open" function from useModalStore when the add post button is pressed', () => {
    const { getByTestId } = render(<ActionButtons />);

    const addPostButton = getByTestId('add-post-button');
    fireEvent.press(addPostButton);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('should call "setNotificationModalVisible" with true when the notification button is pressed', () => {
    const { getByTestId } = render(<ActionButtons />);

    const notificationButton = getByTestId('notification-bell-button');
    fireEvent.press(notificationButton);

    expect(mockSetNotificationModalVisible).toHaveBeenCalledWith(true);
  });
});
