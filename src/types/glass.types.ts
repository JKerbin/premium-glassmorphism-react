import { CSSProperties, ReactNode } from "react";

export interface GlassProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  blur?: number;
  borderRadius?: number;
  border?: boolean;
  shadow?: boolean;
  // WebGL 液体玻璃效果参数
  ior?: number; // 折射率
  glassThickness?: number; // 玻璃厚度
  normalStrength?: number; // 法线强度
  displacementScale?: number; // 位移缩放
  heightBlurFactor?: number; // 高度模糊因子
  sminSmoothing?: number; // SDF 平滑因子
  highlightWidth?: number; // 高光宽度
  showNormals?: boolean; // 是否显示法线（调试用）
  overlayColor?: [number, number, number, number]; // 叠加颜色 RGBA
  enableWebGL?: boolean; // 是否启用 WebGL 效果
}

export interface GlassButtonProps extends GlassProps {
  onClick?: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  type?: "button" | "submit" | "reset";
}

export interface GlassInputProps extends GlassProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "password" | "email" | "number";
  disabled?: boolean;
}

export interface GlassModalProps extends GlassProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}
