import React from "react";
import { GlassProps } from "../types/glass.types";
import { useGlassEffect } from "../hooks/useGlassEffect";

const GlassCard: React.FC<GlassProps> = ({
  children,
  className = "",
  style = {},
  variant = "light",
  blur = 10,
  opacity = 0.1,
  borderRadius = 12,
  border = true,
  shadow = true,
  background,
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
    ...style,
  };

  return (
    <div className={`glass-card ${className}`} style={combinedStyle} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
