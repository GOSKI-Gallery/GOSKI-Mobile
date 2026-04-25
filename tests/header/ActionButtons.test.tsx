
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ActionButtons from '../../components/header/ActionButtons';
import { useModalStore } from '../../states/useModalStore';

// Mock the useModalStore
jest.mock('../../states/useModalStore');

describe('ActionButtons', () => {
  const mockOpen = jest.fn();
  const mockSetNotificationModalVisible = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Provide a mock implementation for the store
    (useModalStore as unknown as jest.Mock).mockReturnValue({
      open: mockOpen,
      setNotificationModalVisible: mockSetNotificationModalVisible,
    });
  });

  it('should render both the add post and notification buttons', () => {
    const { getByTestId } = render(<ActionButtons />);

    // Check if both icons are rendered using their testIDs
    expect(getByTestId('add-post-icon')).toBeTruthy();
    expect(getByTestId('notification-bell-icon')).toBeTruthy();
  });

  it('should call the "open" function from useModalStore when the add post button is pressed', () => {
    const { getByTestId } = render(<ActionButtons />);

    // Find the add post button and simulate a press
    const addPostButton = getByTestId('add-post-button');
    fireEvent.press(addPostButton);

    // Expect the mock "open" function to have been called
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('should call "setNotificationModalVisible" with true when the notification button is pressed', () => {
    const { getByTestId } = render(<ActionButtons />);
    
    // Find the notification button and simulate a press
    const notificationButton = getByTestId('notification-bell-button');
    fireEvent.press(notificationButton);

    // Expect the mock "setNotificationModalVisible" function to have been called with true
    expect(mockSetNotificationModalVisible).toHaveBeenCalledWith(true);
  });
});
