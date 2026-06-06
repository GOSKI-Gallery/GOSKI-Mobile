import React from 'react';
import { render } from '@testing-library/react-native';
import {
  BellIcon,
  AddIcon,
  LikeIcon,
  DeleteIcon,
  EmailIcon,
  LockIcon,
  ExitIcon,
  UserIcon,
  LogoSvg,
} from '../../../components/ui/Icons';

describe('Icons', () => {
  it('renders BellIcon', () => {
    const { getByTestId } = render(<BellIcon />);
  });

  it('renders AddIcon', () => {
    const { getByTestId } = render(<AddIcon />);
  });

  it('renders LikeIcon', () => {
    const { getByTestId } = render(<LikeIcon />);
  });

  it('renders LikeIcon filled', () => {
    const { getByTestId } = render(<LikeIcon filled />);
  });

  it('renders DeleteIcon', () => {
    const { getByTestId } = render(<DeleteIcon />);
  });

  it('renders EmailIcon', () => {
    const { getByTestId } = render(<EmailIcon />);
  });

  it('renders LockIcon', () => {
    const { getByTestId } = render(<LockIcon />);
  });

  it('renders ExitIcon', () => {
    const { getByTestId } = render(<ExitIcon />);
  });

  it('renders UserIcon', () => {
    const { getByTestId } = render(<UserIcon />);
  });

  it('renders LogoSvg', () => {
    const { getByTestId } = render(<LogoSvg />);
  });

  it('renders with custom color and size', () => {
    const { getByTestId } = render(<BellIcon color="red" size={40} />);
  });
});
