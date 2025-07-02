import React from 'react';
import { GlassInputProps } from '../types/glass.types';
import { useGlassEffect } from '../hooks/useGlassEffect';

const GlassInput: React.FC<GlassInputProps> = ({
  className = '',
  style = {},
  variant = 'light',
  blur = 10,
  opacity = 0.1,
  borderRadius = 8,
  border = true,
  shadow = true,
  background,
  placeholder = '',
  value,
  onChange,
  type = 'text',
  disabled = false,
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

  const combinedStyle = {
    ...glassStyle,
    padding: '12px 16px',
    fontSize: '16px',
    color: 'inherit',
    outline: 'none',
    width: '100%',
    ...style,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <input
      className={`glass-input ${className}`}
      style={combinedStyle}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      type={type}
      disabled={disabled}
      {...props}
    />
  );
};

export default GlassInput;
