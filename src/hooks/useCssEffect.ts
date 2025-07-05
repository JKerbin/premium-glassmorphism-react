import { useMemo } from "react";

export interface UseGlassEffectOptions {
  borderRadius?: number;
}

export const useCssEffect = (options: UseGlassEffectOptions = {}) => {
  const {
    borderRadius = 12,
  } = options;

  const glassClasses = useMemo(() => {
    return "glass-card";
  }, []);

  const glassStyle = useMemo(() => {
    return {
      "--glass-border-radius": `${borderRadius}px`,
    };
  }, [borderRadius]);

  return { glassClasses, glassStyle };
};
