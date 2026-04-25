import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginForm from '../../components/auth/LoginForm';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockSetAuth = jest.fn();
jest.mock('../../states/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ setAuth: mockSetAuth }),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.spyOn(Alert, 'alert');

describe('LoginForm', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as unknown as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  it('deve realizar login com sucesso e buscar dados do perfil', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'user-123' },
        session: { access_token: 'token-valido' },
      },
      error: null,
    });

    const mockUserData = {
      id: 'user-123',
      email: 'carlos@goski.com',
      username: 'carlos_dev',
      profile_photo_url: 'http://photo.com/me.jpg'
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUserData, error: null }),
    });

    const { getByPlaceholderText, getByText } = render(<LoginForm />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'carlos@goski.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), '123456');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('users');

      expect(mockSetAuth).toHaveBeenCalledWith(
        mockUserData,
        'token-valido'
      );
      
      expect(mockReplace).toHaveBeenCalledWith('/(main)');
    });
  });

  it('deve mostrar alerta em caso de credenciais inválidas', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const { getByText, getByPlaceholderText } = render(<LoginForm />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'erro@teste.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), 'errada');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Invalid login credentials');
    });
  });
});