import React, { useEffect, useRef, useState } from "react";
import { GlassProps } from "../../types/glass.types";
import { useWebGLEffect } from "../../hooks/useWebGLEffect";
import "./index.scss";

const GlassCard: React.FC<GlassProps> = ({
  children,
  className = "",
  style = {},
  enableWebGL = true,
  ...props
}) => {
  const glassClasses = "glass-card";
  const containerRef = useRef<HTMLDivElement>(null);

  const { canvasRef, screenshotCanvasRef, webglWorking } = useWebGLEffect(
    containerRef,
    enableWebGL,
    style
  );

  return (
    <div
      ref={containerRef}
      className={`${glassClasses} ${className}`}
      style={style}
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
              borderRadius: `${style.borderRadius ?? "0"}px`,
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
