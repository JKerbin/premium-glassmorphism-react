import { CSSProperties, ReactNode } from 'react';

export type GlassVariant = 'light' | 'dark' | 'colored' | 'gradient';

export interface GlassProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: GlassVariant;
  blur?: number;
  opacity?: number;
  borderRadius?: number;
  border?: boolean;
  shadow?: boolean;
  background?: string;
}

export interface GlassButtonProps extends GlassProps {
  onClick?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit' | 'reset';
}

export interface GlassInputProps extends GlassProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  disabled?: boolean;
}

export interface GlassModalProps extends GlassProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}
