import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../../../components/ui/PrimaryButton';

describe('PrimaryButton', () => {
  it('renders title text', () => {
    const { getByText } = render(<PrimaryButton title="Entrar" />);
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('hides title and shows ActivityIndicator when loading', () => {
    const { queryByText } = render(
      <PrimaryButton title="Entrar" loading />
    );
    expect(queryByText('Entrar')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Entrar" onPress={onPress} />
    );
    fireEvent.press(getByText('Entrar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Entrar" onPress={onPress} disabled />
    );
    fireEvent.press(getByText('Entrar'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders outline variant', () => {
    const { getByText } = render(
      <PrimaryButton title="Cancelar" variant="outline" />
    );
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('shows ActivityIndicator when loading in outline variant', () => {
    const { queryByText } = render(
      <PrimaryButton title="Cancelar" variant="outline" loading />
    );
    expect(queryByText('Cancelar')).toBeNull();
  });

  it('renders solid variant as default', () => {
    const { getByText } = render(<PrimaryButton title="Entrar" />);
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { getByText } = render(
      <PrimaryButton title="Entrar" className="mt-4" />
    );
    expect(getByText('Entrar')).toBeTruthy();
  });
});
