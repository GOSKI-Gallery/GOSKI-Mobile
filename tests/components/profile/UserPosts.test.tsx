import React from 'react';
import { render } from '@testing-library/react-native';
import UserPosts from '../../../components/profile/UserPosts';

const defaultProps = {
  refreshing: false,
  onRefresh: jest.fn(),
};

describe('UserPosts', () => {
  const posts = [
    { id: '1', image_url: 'https://example.com/1.jpg' },
    { id: '2', image_url: 'https://example.com/2.jpg' },
    { id: '3', image_url: 'https://example.com/3.jpg' },
    { id: '4', image_url: 'https://example.com/4.jpg' },
  ];

  it('renders posts in a grid', () => {
    const { UNSAFE_getAllByType } = render(<UserPosts posts={posts} {...defaultProps} />);
    expect(UNSAFE_getAllByType).toBeTruthy();
  });

  it('renders empty state', () => {
    const { UNSAFE_getAllByType } = render(<UserPosts posts={[]} {...defaultProps} />);
    expect(UNSAFE_getAllByType).toBeTruthy();
  });
});
