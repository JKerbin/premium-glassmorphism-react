import { useMemo } from "react";
import { createGlassStyle } from "../utils/glassUtils";

export interface UseGlassEffectOptions {
  blur?: number;
  borderRadius?: number;
  border?: boolean;
  shadow?: boolean;
}

export const useGlassEffect = (options: UseGlassEffectOptions = {}) => {
  const {
    blur = 10,
    borderRadius = 12,
    border = true,
    shadow = true,
  } = options;

  const glassClasses = useMemo(() => {
    const classes = ['glass-card'];
    
    // Add border class
    if (border) {
      classes.push('glass-border');
    }
    
    // Add shadow class
    if (shadow) {
      classes.push('glass-shadow');
    }
    
    // Add blur class based on blur value
    if (blur === 5) classes.push('glass-blur-5');
    else if (blur === 15) classes.push('glass-blur-15');
    else if (blur === 20) classes.push('glass-blur-20');
    else classes.push('glass-blur-10'); // default
    
    // Add border radius class based on borderRadius value
    if (borderRadius <= 6) classes.push('glass-rounded-sm');
    else if (borderRadius <= 18) classes.push('glass-rounded-lg');
    else if (borderRadius <= 24) classes.push('glass-rounded-xl');
    else classes.push('glass-rounded-md'); // default
    
    return classes.join(' ');
  }, [blur, borderRadius, border, shadow]);

  const glassStyle = useMemo(() => {
    const style: any = {};
    
    // Set custom blur if not standard values
    if (![5, 10, 15, 20].includes(blur)) {
      style['--glass-blur'] = `${blur}px`;
    }
    
    // Set custom border radius if not standard values
    if (![6, 12, 18, 24].includes(borderRadius)) {
      style['--glass-border-radius'] = `${borderRadius}px`;
    }
    
    return style;
  }, [blur, borderRadius]);

  return { glassClasses, glassStyle };
};
