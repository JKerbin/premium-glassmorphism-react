import { CSSProperties } from "react";
import { GlassVariant } from "../types/glass.types";

export const createGlassStyle = (
  variant: GlassVariant = "light",
  blur: number = 10,
  opacity: number = 0.1,
  borderRadius: number = 12,
  border: boolean = true,
  shadow: boolean = true,
  background?: string
): CSSProperties => {
  const baseStyle: CSSProperties = {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderRadius: `${borderRadius}px`,
    position: "relative",
    overflow: "hidden",
  };

  // 根据变体设置背景
  switch (variant) {
    case "light":
      baseStyle.background = background || `rgba(255, 255, 255, ${opacity})`;
      break;
    case "dark":
      baseStyle.background = background || `rgba(0, 0, 0, ${opacity})`;
      break;
    case "colored":
      baseStyle.background = background || `rgba(59, 130, 246, ${opacity})`;
      break;
    case "gradient":
      baseStyle.background =
        background ||
        `linear-gradient(135deg, rgba(255, 255, 255, ${opacity}) 0%, rgba(59, 130, 246, ${
          opacity * 0.8
        }) 100%)`;
      break;
  }

  // 添加边框
  if (border) {
    baseStyle.border = "1px solid rgba(255, 255, 255, 0.2)";
  }

  // 添加阴影
  if (shadow) {
    baseStyle.boxShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
  }

  return baseStyle;
};

export const getGlassVariants = () => ({
  light: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  dark: {
    background: "rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  colored: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  gradient: {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
});
