import { useMemo } from "react";

export interface UseGlassEffectOptions {
  enableShadowBox?: boolean;
}

export const useCssEffect = (options: UseGlassEffectOptions = {}) => {
  const { enableShadowBox } = options;

  const glassClasses = useMemo(() => {
    const className = ["glass-card"];
    if(enableShadowBox)className.push("glass-card-shadow");
    return className.join(" ");
  }, [enableShadowBox]);

  return { glassClasses };
};
