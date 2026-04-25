
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationModal from '../../components/notification/NotificationModal';
import { useAuthStore } from '../../states/useAuthStore';
import { useNotificationStore } from '../../states/useNotificationStore';

jest.mock('../../states/useAuthStore');
jest.mock('../../states/useNotificationStore');
jest.mock('../../lib/time', () => ({
  timeAgo: jest.fn((date: string) => '5 min ago'),
}));

const mockUser = {
  id: '123',
  username: 'testuser',
  profile_photo_url: 'https://example.com/photo.jpg',
};

const mockNotifications = [
  {
    id: '1',
    user: { username: 'user1', profile_photo_url: '' },
    type: 'like',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user: { username: 'user2', profile_photo_url: '' },
    type: 'follow',
    is_read: true,
    created_at: new Date().toISOString(),
  },
];

describe('NotificationModal', () => {
  const mockOnClose = jest.fn();
  const mockFetchNotifications = jest.fn().mockResolvedValue(undefined);
  const mockMarkAllAsRead = jest.fn();
  const mockDismissNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: mockUser });

    (useNotificationStore as unknown as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: mockFetchNotifications,
      markAllAsRead: mockMarkAllAsRead,
      dismissNotification: mockDismissNotification,
    });
  });

  it('should show loading indicator and fetch notifications', async () => {
    const { findByTestId } = render(<NotificationModal visible={true} onClose={mockOnClose} />);
    
    expect(await findByTestId('loading-indicator')).toBeTruthy();

    await waitFor(() => {
      expect(mockFetchNotifications).toHaveBeenCalledWith(mockUser.id);
    });
  });

  it('should display "No notification" message', async () => {
    const { findByText } = render(<NotificationModal visible={true} onClose={mockOnClose} />);
    expect(await findByText('Nenhuma notificação.')).toBeTruthy();
  });

  describe('with notifications', () => {
    beforeEach(() => {
      (useNotificationStore as unknown as jest.Mock).mockReturnValue({
        notifications: mockNotifications,
        unreadCount: 1,
        fetchNotifications: mockFetchNotifications,
        markAllAsRead: mockMarkAllAsRead,
        dismissNotification: mockDismissNotification,
      });
    });

    it('should render a list of notifications', async () => {
      const { findByText } = render(<NotificationModal visible={true} onClose={mockOnClose} />);
      
      expect(await findByText('user1')).toBeTruthy();
      expect(await findByText('user2')).toBeTruthy();
    });

    it('should call markAllAsRead when "Mark as read" is pressed', async () => {
      const { findByText } = render(<NotificationModal visible={true} onClose={mockOnClose} />);
      
      const markAsReadButton = await findByText('Marcar como lido');
      fireEvent.press(markAsReadButton);
      
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });

    it('should call dismissNotification when delete icon is pressed', async () => {
      const { findByTestId } = render(<NotificationModal visible={true} onClose={mockOnClose} />);
      
      const deleteButton = await findByTestId('delete-notification-button-1');
      fireEvent.press(deleteButton);
      
      expect(mockDismissNotification).toHaveBeenCalledWith('1');
    });

    it('should call onClose when the close button is pressed', async () => {
        const { getByText } = render(<NotificationModal visible={true} onClose={mockOnClose} />);
        
        fireEvent.press(getByText('Fechar'));
        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled();
        })
      });
  });
});
