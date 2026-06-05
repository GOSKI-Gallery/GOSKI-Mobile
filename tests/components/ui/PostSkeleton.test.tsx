import React from 'react';
import { render } from '@testing-library/react-native';
import PostSkeleton from '../../../components/ui/PostSkeleton';

describe('PostSkeleton', () => {
  it('renders correctly', () => {
    const { UNSAFE_getAllByType } = render(<PostSkeleton />);
    expect(UNSAFE_getAllByType).toBeTruthy();
  });
});
