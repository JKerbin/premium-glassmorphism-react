import { useEffect, useRef, useCallback, useState, CSSProperties } from "react";
import html2canvas from "html2canvas";
import { fsSource, vsSource } from "../assets/shaderSourceCode";

interface UseWebGLEffectReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  screenshotCanvasRef: React.RefObject<HTMLCanvasElement>;
  webglWorking: boolean;
}

export const useWebGLEffect = (
  containerRef: React.RefObject<HTMLDivElement>,
  enableWebGL: boolean,
  style: CSSProperties
): UseWebGLEffectReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenshotCanvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const backgroundTextureRef = useRef<WebGLTexture | null>(null);
  const [webglWorking, setWebglWorking] = useState(true);
  console.log(style);
  // Create shader
  const createShader = useCallback(
    (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
    []
  );

  // Screenshot update function
  const updateScreenshot = useCallback(async () => {
    if (
      !containerRef.current ||
      !screenshotCanvasRef.current ||
      !glRef.current ||
      !backgroundTextureRef.current
    ) {
      return;
    }

    try {
      const rect = containerRef.current.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      // Calculate absolute page coordinates (including scroll offset)
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const absoluteLeft = rect.left + scrollX;
      const absoluteTop = rect.top + scrollY;
      // Get full page dimensions
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
      // Improve screenshot quality with moderate scaling
      const fullPageCanvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: devicePixelRatio, // Use device pixel ratio
        width: fullWidth,
        height: fullHeight,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: null, // Keep transparent background
        removeContainer: true,
        imageTimeout: 0,
        logging: false,
      });
      const screenshotCanvas = screenshotCanvasRef.current;
      // Set Canvas dimensions using device pixel ratio
      const canvasWidth = rect.width * devicePixelRatio;
      const canvasHeight = rect.height * devicePixelRatio;
      screenshotCanvas.width = canvasWidth;
      screenshotCanvas.height = canvasHeight;
      const ctx = screenshotCanvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
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
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        screenshotCanvas
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Start render effect
      render();
    } catch (error) {
      setWebglWorking(false);
    }
  }, [containerRef, style, createShader]);

  // Render function
  const render = useCallback(() => {
    if (!canvasRef.current || !glRef.current || !containerRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const gl = glRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Set actual Canvas dimensions using device pixel ratio
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    const canvasWidth = displayWidth * devicePixelRatio;
    const canvasHeight = displayHeight * devicePixelRatio;

    // Set Canvas actual pixel dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set Canvas display dimensions
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Create shader program for this render
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Set up geometry
    const positions = [
      -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Set uniform values
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
    const mousePosUniformLocation = gl.getUniformLocation(
      program,
      "u_mousePos"
    );
    const glassSizeUniformLocation = gl.getUniformLocation(
      program,
      "u_glassSize"
    );
    const backgroundTextureUniformLocation = gl.getUniformLocation(
      program,
      "u_backgroundTexture"
    );
    const cornerRadiusUniformLocation = gl.getUniformLocation(
      program,
      "u_cornerRadius"
    );

    gl.uniform2f(resolutionUniformLocation, displayWidth, displayHeight);
    gl.uniform2f(mousePosUniformLocation, displayWidth / 2, displayHeight / 2);
    gl.uniform2f(glassSizeUniformLocation, displayWidth, displayHeight);
    gl.uniform1f(cornerRadiusUniformLocation, parseInt(String(style.borderRadius ?? 0)));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, backgroundTextureRef.current);
    gl.uniform1i(backgroundTextureUniformLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [containerRef, style, createShader]);

  // Initialize WebGL
  useEffect(() => {
    if (!enableWebGL || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // Enable antialiasing
    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      setWebglWorking(false);
      return;
    }

    glRef.current = gl;

    // Create background texture
    const backgroundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    backgroundTextureRef.current = backgroundTexture;

    // Initial screenshot
    setTimeout(() => {
      updateScreenshot();
    }, 10);
  }, [enableWebGL, createShader, render, updateScreenshot]);

  return {
    canvasRef,
    screenshotCanvasRef,
    webglWorking,
  };
};
