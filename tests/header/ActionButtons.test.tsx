import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ActionButtons from '../../components/header/ActionButtons';
import { useModalStore } from '../../states/useModalStore';
import { useNotificationStore } from '../../states/useNotificationStore';

jest.mock('../../states/useModalStore');
jest.mock('../../states/useNotificationStore');

describe('ActionButtons', () => {
  const mockOpen = jest.fn();
  const mockSetNotificationModalVisible = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useModalStore as unknown as jest.Mock).mockReturnValue({
      openCreatePostModal: mockOpen,
      setNotificationModalVisible: mockSetNotificationModalVisible,
    });

    (useNotificationStore as unknown as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        notifications: [],
        unreadCount: 0,
        fetchNotifications: jest.fn(),
        markAllAsRead: jest.fn(),
        dismissNotification: jest.fn(),
      };
      return selector ? selector(state) : state;
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

  it('should display badge with unread count', () => {
    (useNotificationStore as unknown as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        notifications: [],
        unreadCount: 5,
        fetchNotifications: jest.fn(),
        markAllAsRead: jest.fn(),
        dismissNotification: jest.fn(),
      };
      return selector ? selector(state) : state;
    });

    const { getByText } = render(<ActionButtons />);

    expect(getByText('5')).toBeTruthy();
  });

  it('should display "99+" when unread count exceeds 99', () => {
    (useNotificationStore as unknown as jest.Mock).mockImplementation((selector?: any) => {
      const state = {
        notifications: [],
        unreadCount: 150,
        fetchNotifications: jest.fn(),
        markAllAsRead: jest.fn(),
        dismissNotification: jest.fn(),
      };
      return selector ? selector(state) : state;
    });

    const { getByText } = render(<ActionButtons />);

    expect(getByText('99+')).toBeTruthy();
  });

  it('should not display badge when unread count is 0', () => {
    const { queryByText } = render(<ActionButtons />);

    expect(queryByText('0')).toBeNull();
  });
});
