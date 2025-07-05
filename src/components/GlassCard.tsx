import React, { useRef } from "react";
import { GlassProps } from "../types/glass.types";
import { useGlassEffect } from "../hooks/useGlassEffect";
import { useWebGLGlass } from "../hooks/useWebGLGlass";

const GlassCard: React.FC<GlassProps> = ({
  children,
  className = "",
  style = {},
  borderRadius = 100,
  enableWebGL = true,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { glassClasses, glassStyle } = useGlassEffect({
    blur: 0,
    borderRadius,
  });

  const webGLConfig = {
    blur: 0,
    borderRadius,
    enableWebGL,
  };

  const { canvasRef, screenshotCanvasRef, webglWorking } = useWebGLGlass(
    containerRef,
    webGLConfig
  );

  const combinedStyle = {
    ...glassStyle,
    ...style,
    position: "relative" as const,
  };

  return (
    <div
      ref={containerRef}
      className={`${glassClasses} ${className}`}
      style={combinedStyle}
      {...props}
    >
      {enableWebGL && webglWorking && (
        <>
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 1,
              borderRadius: `${borderRadius}px`,
            }}
          />
          <canvas ref={screenshotCanvasRef} style={{ display: "none" }} />
        </>
      )}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
};

export default GlassCard;
