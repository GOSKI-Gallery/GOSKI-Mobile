import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import UploadButton from '../../../components/ui/UploadButton';

describe('UploadButton', () => {
  it('renders label when no image', () => {
    const { getByText } = render(<UploadButton />);
    expect(getByText('Escolher foto')).toBeTruthy();
  });

  it('renders custom label', () => {
    const { getByText } = render(<UploadButton label="Selecionar" />);
    expect(getByText('Selecionar')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<UploadButton onPress={onPress} />);
    fireEvent.press(getByText('Escolher foto'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
