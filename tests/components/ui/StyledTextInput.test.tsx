import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StyledTextInput from '../../../components/ui/StyledTextInput';
import { EmailIcon } from '../../../components/ui/Icons';

describe('StyledTextInput', () => {
  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(
      <StyledTextInput
        icon={<EmailIcon />}
        placeholder="Email"
      />
    );
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <StyledTextInput
        icon={<EmailIcon />}
        placeholder="Email"
        onChangeText={onChangeText}
      />
    );
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    expect(onChangeText).toHaveBeenCalledWith('test@test.com');
  });

  it('renders without icon', () => {
    const { getByPlaceholderText } = render(
      <StyledTextInput placeholder="No icon" />
    );
    expect(getByPlaceholderText('No icon')).toBeTruthy();
  });
});
