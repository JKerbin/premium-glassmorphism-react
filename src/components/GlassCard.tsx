import React from "react";
import { GlassProps } from "../types/glass.types";
import { useGlassEffect } from "../hooks/useGlassEffect";

const GlassCard: React.FC<GlassProps> = ({
  children,
  className = "",
  style = {},
  blur = 10,
  borderRadius = 12,
  border = true,
  shadow = true,
  ...props
}) => {
  const { glassClasses, glassStyle } = useGlassEffect({
    blur,
    borderRadius,
    border,
    shadow,
  });

  const combinedStyle = {
    ...glassStyle,
    ...style,
  };

  return (
    <div className={`${glassClasses} ${className}`} style={combinedStyle} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
