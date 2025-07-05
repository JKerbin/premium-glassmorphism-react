import { CSSProperties, ReactNode } from "react";

export interface GlassProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  borderRadius?: number;
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
