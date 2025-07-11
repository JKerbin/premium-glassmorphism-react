import { CSSProperties, ReactNode } from "react";

export interface GlassProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  enableWebGL?: boolean;
}
