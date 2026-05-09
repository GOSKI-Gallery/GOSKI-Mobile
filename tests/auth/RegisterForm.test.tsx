import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterForm from '../../components/auth/RegisterForm';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

const mockSetAuth = jest.fn();
jest.mock('../../states/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ setAuth: mockSetAuth }),
}));

jest.spyOn(Alert, 'alert');

describe('RegisterForm', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  it('should show an alert if trying to register with empty fields', () => {
    const { getByText } = render(<RegisterForm />);
    
    const button = getByText('Registrar');
    fireEvent.press(button);

    expect(Alert.alert).toHaveBeenCalledWith("Por favor, preencha todos os campos.");
  });

  it('should register successfully and redirect to home', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'carlos@goski.com', user_metadata: { username: 'carlos' } },
        session: { access_token: 'fake-token' },
      },
      error: null,
    });

    const { getByPlaceholderText, getByText } = render(<RegisterForm />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'carlos');
    fireEvent.changeText(getByPlaceholderText('Email'), 'carlos@goski.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), 'senha123');
    
    fireEvent.press(getByText('Registrar'));

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'carlos' }),
        'fake-token'
      );
      expect(mockReplace).toHaveBeenCalledWith('/(main)');
    });
  });
});