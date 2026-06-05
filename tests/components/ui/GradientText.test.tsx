import React from 'react';
import { render } from '@testing-library/react-native';
import GradientText from '../../../components/ui/GradientText';

describe('GradientText', () => {
  it('renders children text', () => {
    const { getAllByText } = render(<GradientText>GOSKI</GradientText>);
    expect(getAllByText('GOSKI').length).toBe(2);
  });
});
