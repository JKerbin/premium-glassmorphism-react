import React, { useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { GlassProps } from "../types/glass.types";
import { useGlassEffect } from "../hooks/useGlassEffect";

const GlassCard: React.FC<GlassProps> = ({
  children,
  className = "",
  style = {},
  blur = 0,
  borderRadius = 100,
  border = true,
  shadow = true,
  // WebGL 参数
  ior = 1.1,
  glassThickness = 15,
  normalStrength = 6.4,
  displacementScale = 1.0,
  heightBlurFactor = 5.0,
  sminSmoothing = 20.0,
  highlightWidth = 3.5,
  showNormals = false,
  overlayColor = [1.0, 1.0, 1.0, 1.0],
  enableWebGL = true,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenshotCanvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const backgroundTextureRef = useRef<WebGLTexture | null>(null);
  const animationFrameRef = useRef<number>();
  const [webglWorking, setWebglWorking] = React.useState(true);

  const { glassClasses, glassStyle } = useGlassEffect({
    blur,
    borderRadius,
    border,
    shadow,
  });

  // 顶点着色器源码
  const vsSource = `
    precision mediump float;
    
    attribute vec2 a_position;

    uniform vec2 u_resolution;
    uniform vec2 u_mousePos;
    uniform vec2 u_glassSize;

    varying vec2 v_screenTexCoord;
    varying vec2 v_shapeCoord;

    void main() {
        vec2 screenPos = u_mousePos + a_position * u_glassSize;
        vec2 clipSpacePos = (screenPos / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpacePos * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_screenTexCoord = screenPos / u_resolution;
        v_screenTexCoord.y = 1.0 - v_screenTexCoord.y;
        v_shapeCoord = a_position;
    }
  `;

  // 片段着色器源码
  const fsSource = `
    precision mediump float;

    uniform sampler2D u_backgroundTexture;
    uniform vec2 u_resolution;
    uniform vec2 u_glassSize;
    uniform float u_cornerRadius;
    uniform float u_ior;
    uniform float u_glassThickness;
    uniform float u_normalStrength;
    uniform float u_displacementScale;
    uniform float u_heightTransitionWidth;
    uniform float u_sminSmoothing;
    uniform int u_showNormals;
    uniform float u_blurRadius;
    uniform vec4 u_overlayColor;
    uniform float u_highlightWidth;

    varying vec2 v_screenTexCoord;
    varying vec2 v_shapeCoord;

    float smin_polynomial(float a, float b, float k) {
        if (k <= 0.0) return min(a, b);
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
    }

    float smax_polynomial(float a, float b, float k) {
        if (k <= 0.0) return max(a, b);
        float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
        return mix(b, a, h) + k * h * (1.0 - h);
    }

    float sdRoundedBoxSharp(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }

    float sdRoundedBoxSmooth(vec2 p, vec2 b, float r, float k_smooth) {
        if (k_smooth <= 0.0) {
            return sdRoundedBoxSharp(p,b,r);
        }
        vec2 q = abs(p) - b + r;

        float termA_smooth = smax_polynomial(q.x, q.y, k_smooth);
        float termB_smooth = smin_polynomial(termA_smooth, 0.0, k_smooth * 0.5); 

        vec2 q_for_length_smooth = vec2(
            smax_polynomial(q.x, 0.0, k_smooth),
            smax_polynomial(q.y, 0.0, k_smooth)
        );
        float termC_smooth = length(q_for_length_smooth);
        
        return termB_smooth + termC_smooth - r;
    }

    float getHeightFromSDF(vec2 p_pixel_space, vec2 b_pixel_space, float r_pixel, float k_s, float transition_w) {
        float dist_sample = sdRoundedBoxSmooth(p_pixel_space, b_pixel_space, r_pixel, k_s);
        float normalized_dist = dist_sample / transition_w;
        
        const float steepness_factor = 6.0;
        float height = 1.0 - (1.0 / (1.0 + exp(-normalized_dist * steepness_factor)));
        
        return clamp(height, 0.0, 1.0);
    }

    void main() {
        float actualCornerRadius = min(u_cornerRadius, min(u_glassSize.x, u_glassSize.y) / 2.0);
        
        vec2 current_p_pixel = v_shapeCoord * u_glassSize;
        vec2 glass_half_size_pixel = u_glassSize / 2.0;

        float dist_for_shape_boundary = sdRoundedBoxSmooth(current_p_pixel, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing);
        if (dist_for_shape_boundary > 0.001) {
            discard;
        }

        vec2 pixel_step_in_norm_space = vec2(1.0 / u_glassSize.x, 1.0 / u_glassSize.y);

        float norm_step_x1 = pixel_step_in_norm_space.x * 0.75;
        float norm_step_y1 = pixel_step_in_norm_space.y * 0.75;
        float norm_step_x2 = pixel_step_in_norm_space.x * 1.5;
        float norm_step_y2 = pixel_step_in_norm_space.y * 1.5;

        float h_px1 = getHeightFromSDF((v_shapeCoord + vec2(norm_step_x1, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_nx1 = getHeightFromSDF((v_shapeCoord - vec2(norm_step_x1, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_px2 = getHeightFromSDF((v_shapeCoord + vec2(norm_step_x2, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_nx2 = getHeightFromSDF((v_shapeCoord - vec2(norm_step_x2, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);

        float grad_x1 = (h_px1 - h_nx1) / (2.0 * norm_step_x1 * u_glassSize.x);
        float grad_x2 = (h_px2 - h_nx2) / (2.0 * norm_step_x2 * u_glassSize.x);
        float delta_x = mix(grad_x1, grad_x2, 0.5);

        float h_py1 = getHeightFromSDF((v_shapeCoord + vec2(0.0, norm_step_y1)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_ny1 = getHeightFromSDF((v_shapeCoord - vec2(0.0, norm_step_y1)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_py2 = getHeightFromSDF((v_shapeCoord + vec2(0.0, norm_step_y2)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_ny2 = getHeightFromSDF((v_shapeCoord - vec2(0.0, norm_step_y2)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        
        float grad_y1 = (h_py1 - h_ny1) / (2.0 * norm_step_y1 * u_glassSize.y);
        float grad_y2 = (h_py2 - h_ny2) / (2.0 * norm_step_y2 * u_glassSize.y);
        float delta_y = mix(grad_y1, grad_y2, 0.5);

        vec3 surfaceNormal3D = normalize(vec3(-delta_x * u_normalStrength, -delta_y * u_normalStrength, 1.0));

        if (u_showNormals == 1) {
            gl_FragColor = vec4(surfaceNormal3D * 0.5 + 0.5, 1.0);
            return;
        }

        vec3 incidentLightDir = normalize(vec3(0.0, 0.0, -1.0));
        vec3 refractedIntoGlass = refract(incidentLightDir, surfaceNormal3D, 1.0 / u_ior);
        vec3 refractedOutOfGlass = refract(refractedIntoGlass, -surfaceNormal3D, u_ior);

        vec2 offset_in_pixels = refractedOutOfGlass.xy * u_glassThickness;
        vec2 offset = (offset_in_pixels / u_resolution) * u_displacementScale;

        vec2 refractedTexCoord = v_screenTexCoord + offset;
        refractedTexCoord = clamp(refractedTexCoord, 0.001, 0.999);

        vec4 blurredColor = vec4(0.0);
        vec2 texelSize = 1.0 / u_resolution;
        float blurPixelRadius = u_blurRadius; 

        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0, -1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0, -1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0, -1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0,  0.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0,  0.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0,  0.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0,  1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0,  1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0,  1.0) * blurPixelRadius * texelSize);
        
        blurredColor /= 9.0;

        float height_val = getHeightFromSDF(current_p_pixel, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        vec4 finalColor = mix(blurredColor, u_overlayColor, height_val * 0.05);
        
        float highlight_dist = abs(dist_for_shape_boundary);
        float highlight_alpha = 1.0 - smoothstep(0.0, u_highlightWidth, highlight_dist);
        highlight_alpha = max(0.0, highlight_alpha);

        float directionalFactor = (surfaceNormal3D.x * surfaceNormal3D.y + 1.0) * 0.5;
        float finalHighlightAlpha = highlight_alpha * directionalFactor;
        
        gl_FragColor = mix(finalColor, vec4(1.0, 1.0, 1.0, 1.0), finalHighlightAlpha);
    }
  `;

  // 创建着色器
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compile error (${type === gl.VERTEX_SHADER ? "VS" : "FS"}):`, gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }, []);

  // 截图更新函数
  const updateScreenshot = useCallback(async () => {
    if (!containerRef.current || !screenshotCanvasRef.current || !glRef.current || !backgroundTextureRef.current) {
      return;
    }

    try {
      const rect = containerRef.current.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      // 计算页面绝对坐标（包含滚动偏移）
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const absoluteLeft = rect.left + scrollX;
      const absoluteTop = rect.top + scrollY;
      // 获取完整页面的尺寸
      const fullWidth = Math.max(
        document.body.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.clientWidth,
        document.documentElement.scrollWidth,
        document.documentElement.offsetWidth
      );
      const fullHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      // 提高截图质量，使用适中的缩放比例
      const fullPageCanvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: devicePixelRatio, // 使用设备像素比
        width: fullWidth,
        height: fullHeight,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: null, // 保持透明背景
        removeContainer: true,
        imageTimeout: 0,
        logging: false,
      });
      const screenshotCanvas = screenshotCanvasRef.current;
      // 使用设备像素比设置Canvas尺寸
      const canvasWidth = rect.width * devicePixelRatio;
      const canvasHeight = rect.height * devicePixelRatio;
      screenshotCanvas.width = canvasWidth;
      screenshotCanvas.height = canvasHeight;
      const ctx = screenshotCanvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const sourceScale = devicePixelRatio;
      const sourceLeft = absoluteLeft * sourceScale;
      const sourceTop = absoluteTop * sourceScale;
      const sourceWidth = rect.width * sourceScale;
      const sourceHeight = rect.height * sourceScale;
      ctx.drawImage(
        fullPageCanvas,
        sourceLeft,
        sourceTop,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
      );
      const gl = glRef.current;
      gl.bindTexture(gl.TEXTURE_2D, backgroundTextureRef.current);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      let error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.warn("WebGL error before texture upload:", error);
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, screenshotCanvas);
      error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.warn("WebGL error after texture upload:", error);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      console.log('updateScreenshot');
    } catch (error) {
      console.error("截图失败:", error);
      setWebglWorking(false);
    }
  }, []);

  // 只在挂载和依赖变化时截图
  useEffect(() => {
    if (!enableWebGL) return;
    updateScreenshot();
  }, [
    enableWebGL,
    blur,
    borderRadius,
    border,
    shadow,
    ior,
    glassThickness,
    normalStrength,
    displacementScale,
    heightBlurFactor,
    sminSmoothing,
    highlightWidth,
    showNormals,
    overlayColor,
    updateScreenshot
  ]);

  // 渲染函数
  const render = useCallback(() => {
    if (!canvasRef.current || !glRef.current || !programRef.current || !containerRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 使用设备像素比设置实际Canvas尺寸
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    const canvasWidth = displayWidth * devicePixelRatio;
    const canvasHeight = displayHeight * devicePixelRatio;

    // 设置Canvas的实际像素尺寸
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 设置Canvas的显示尺寸
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program);

    // 设置 uniform 值
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const mousePosUniformLocation = gl.getUniformLocation(program, "u_mousePos");
    const glassSizeUniformLocation = gl.getUniformLocation(program, "u_glassSize");
    const backgroundTextureUniformLocation = gl.getUniformLocation(program, "u_backgroundTexture");
    const cornerRadiusUniformLocation = gl.getUniformLocation(program, "u_cornerRadius");
    const iorUniformLocation = gl.getUniformLocation(program, "u_ior");
    const glassThicknessUniformLocation = gl.getUniformLocation(program, "u_glassThickness");
    const normalStrengthUniformLocation = gl.getUniformLocation(program, "u_normalStrength");
    const displacementScaleUniformLocation = gl.getUniformLocation(program, "u_displacementScale");
    const heightTransitionWidthUniformLocation = gl.getUniformLocation(program, "u_heightTransitionWidth");
    const sminSmoothingUniformLocation = gl.getUniformLocation(program, "u_sminSmoothing");
    const showNormalsUniformLocation = gl.getUniformLocation(program, "u_showNormals");
    const blurRadiusUniformLocation = gl.getUniformLocation(program, "u_blurRadius");
    const overlayColorUniformLocation = gl.getUniformLocation(program, "u_overlayColor");
    const highlightWidthUniformLocation = gl.getUniformLocation(program, "u_highlightWidth");

    gl.uniform2f(resolutionUniformLocation, displayWidth, displayHeight);
    gl.uniform2f(mousePosUniformLocation, displayWidth / 2, displayHeight / 2);
    gl.uniform2f(glassSizeUniformLocation, displayWidth, displayHeight);
    gl.uniform1f(cornerRadiusUniformLocation, borderRadius);
    gl.uniform1f(iorUniformLocation, ior);
    gl.uniform1f(glassThicknessUniformLocation, glassThickness);
    gl.uniform1f(normalStrengthUniformLocation, normalStrength);
    gl.uniform1f(displacementScaleUniformLocation, displacementScale);
    gl.uniform1f(heightTransitionWidthUniformLocation, heightBlurFactor);
    gl.uniform1f(sminSmoothingUniformLocation, sminSmoothing);
    gl.uniform1i(showNormalsUniformLocation, showNormals ? 1 : 0);
    gl.uniform1f(blurRadiusUniformLocation, blur);
    gl.uniform4f(overlayColorUniformLocation, overlayColor[0], overlayColor[1], overlayColor[2], overlayColor[3]);
    gl.uniform1f(highlightWidthUniformLocation, highlightWidth);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, backgroundTextureRef.current);
    gl.uniform1i(backgroundTextureUniformLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [borderRadius, ior, glassThickness, normalStrength, displacementScale, heightBlurFactor, sminSmoothing, showNormals, blur, overlayColor, highlightWidth]);

  // 初始化 WebGL
  useEffect(() => {
    if (!enableWebGL || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // 启用抗锯齿
    const gl = canvas.getContext("webgl", { 
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    });
    
    if (!gl) {
      console.warn("WebGL not supported, falling back to CSS effects");
      setWebglWorking(false);
      return;
    }

    glRef.current = gl;

    // 创建着色器程序
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
      console.error("Failed to create shaders");
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      console.error("Failed to create program");
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    // 设置几何体
    const positions = [-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // 创建背景纹理
    const backgroundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    backgroundTextureRef.current = backgroundTexture;

    // 开始渲染循环
    render();

    // 初始截图
    setTimeout(() => {
      updateScreenshot();
    }, 100);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableWebGL, createShader, render, updateScreenshot]);

  const combinedStyle = {
    ...glassStyle,
    ...style,
    position: 'relative' as const,
    // 如果不启用 WebGL 或 WebGL 不工作，则使用传统的 CSS 效果
    ...(!enableWebGL || !webglWorking) && {
      backdropFilter: `blur(${blur}px) saturate(180%)`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: `${borderRadius}px`,
      border: border ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
      boxShadow: shadow 
        ? '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
        : 'none',
    }
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
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
              borderRadius: `${borderRadius}px`,
            }}
          />
          <canvas
            ref={screenshotCanvasRef}
            style={{ display: 'none' }}
          />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
