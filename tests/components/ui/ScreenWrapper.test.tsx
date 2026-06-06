import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ScreenWrapper from '../../../components/ui/ScreenWrapper';

describe('ScreenWrapper', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ScreenWrapper>
        <Text>Hello</Text>
      </ScreenWrapper>
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { getByText } = render(
      <ScreenWrapper className="pt-10">
        <Text>Test</Text>
      </ScreenWrapper>
    );
    expect(getByText('Test')).toBeTruthy();
  });
});
