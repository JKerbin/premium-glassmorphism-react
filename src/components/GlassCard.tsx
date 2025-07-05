import React, { useRef } from "react";
import { GlassProps } from "../types/glass.types";
import { useCssEffect } from "../hooks/useCssEffect";
import { useWebGLEffect } from "../hooks/useWebGLEffect";

const GlassCard: React.FC<GlassProps> = ({
  children,
  className = "",
  style = {},
  enableShadowBox = true,
  enableWebGL = true,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { glassClasses } = useCssEffect({
    enableShadowBox,
  });

  console.log(style);

  const { canvasRef, screenshotCanvasRef, webglWorking } = useWebGLEffect(
    containerRef,
    enableWebGL,
    style,
  );

  const combinedStyle = {
    ...style,
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
