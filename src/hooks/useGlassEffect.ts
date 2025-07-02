import { useMemo } from 'react';
import { createGlassStyle } from '../utils/glassUtils';
import { GlassVariant } from '../types/glass.types';

export interface UseGlassEffectOptions {
  variant?: GlassVariant;
  blur?: number;
  opacity?: number;
  borderRadius?: number;
  border?: boolean;
  shadow?: boolean;
  background?: string;
}

export const useGlassEffect = (options: UseGlassEffectOptions = {}) => {
  const {
    variant = 'light',
    blur = 10,
    opacity = 0.1,
    borderRadius = 12,
    border = true,
    shadow = true,
    background,
  } = options;

  const glassStyle = useMemo(
    () => createGlassStyle(variant, blur, opacity, borderRadius, border, shadow, background),
    [variant, blur, opacity, borderRadius, border, shadow, background]
  );

  return { glassStyle };
};
