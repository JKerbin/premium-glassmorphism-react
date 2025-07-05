import { CSSProperties, ReactNode } from "react";

export interface GlassProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  borderRadius?: number;
  enableWebGL?: boolean; // 是否启用 WebGL 效果
}
