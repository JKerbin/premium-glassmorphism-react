import React from 'react';
import { GlassButtonProps } from '../types/glass.types';
import { useGlassEffect } from '../hooks/useGlassEffect';

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  className = '',
  style = {},
  variant = 'light',
  blur = 10,
  opacity = 0.1,
  borderRadius = 8,
  border = true,
  shadow = true,
  background,
  onClick,
  disabled = false,
  size = 'medium',
  type = 'button',
  ...props
}) => {
  const { glassStyle } = useGlassEffect({
    variant,
    blur,
    opacity,
    borderRadius,
    border,
    shadow,
    background,
  });

  const sizeStyles = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' },
  };

  const combinedStyle = {
    ...glassStyle,
    ...sizeStyles[size],
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.3s ease',
    border: 'none',
    outline: 'none',
    ...style,
  };

  return (
    <button
      className={`glass-button ${className}`}
      style={combinedStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;
