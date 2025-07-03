// ========== WebGL 初始化 ==========
// 获取HTML中的canvas元素，这是WebGL渲染的目标
const canvas = document.getElementById("glCanvas");
const glassContainer = document.getElementById("glassContainer");
const screenshotCanvas = document.getElementById("screenshotCanvas");

// 获取WebGL渲染上下文，这是所有WebGL操作的入口点
const gl = canvas.getContext("webgl");

// 检查浏览器是否支持WebGL
if (!gl) {
  alert("WebGL not supported!");
  throw new Error("WebGL not supported");
}

// --- 玻璃参数（固定值） ---

let glassWidth = 150;
let glassHeight = 170;
let cornerRadius = 32;
let ior = 1.1;
let glassThickness = 41;
let normalStrength = 6.4;
let displacementScale = 1.0;
let heightBlurFactor = 8.0;
let sminSmoothing = 20.0;
let blurRadius = 0.0;
let highlightWidth = 3.5;
let showNormals = false;

// ========== 鼠标交互处理 ==========
// 玻璃容器的位置坐标，初始化为屏幕中心
let glassX = window.innerWidth / 2;
let glassY = window.innerHeight / 2;

// 拖拽状态标志，用于跟踪玻璃是否正在被拖拽
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// ========== 截图更新管理 ==========
// 防抖函数，避免频繁截图影响性能
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 防抖的截图更新函数（延迟1ms执行）
const debouncedUpdateScreenshot = debounce(updateScreenshot, 1);

// 监听页面内容变化
const mutationObserver = new MutationObserver((mutations) => {
  // 检查是否有实质性的变化（排除玻璃容器自身的位置变化）
  const hasSignificantChange = mutations.some(mutation => {
    // 排除玻璃容器的样式变化
    if (mutation.target === glassContainer) return false;
    
    // 排除玻璃容器内部的变化
    if (glassContainer.contains(mutation.target)) return false;
    
    // 检查是否有节点添加/删除或属性变化
    return mutation.type === 'childList' || 
           (mutation.type === 'attributes' && 
            ['style', 'class', 'src'].includes(mutation.attributeName));
  });
  
  if (hasSignificantChange) {
    debouncedUpdateScreenshot();
  }
});

// 开始监听DOM变化
mutationObserver.observe(document.body, {
  childList: true,        // 监听子节点的添加/删除
  subtree: true,          // 监听所有后代节点
  attributes: true,       // 监听属性变化
  attributeFilter: ['style', 'class', 'src'] // 只监听这些属性
});

// 监听窗口大小变化
const resizeObserver = new ResizeObserver(() => {
  debouncedUpdateScreenshot();
});

// 监听body元素的大小变化（可能由内容变化引起）
resizeObserver.observe(document.body);

// 监听窗口resize事件
window.addEventListener('resize', debouncedUpdateScreenshot);

// 监听滚动事件（页面滚动可能影响截图内容）
window.addEventListener('scroll', debouncedUpdateScreenshot, { passive: true });

// 页面加载完成后的初始截图
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateScreenshot, 100);
});

// 页面完全加载后再次截图（确保所有资源都已加载）
window.addEventListener('load', () => {
  setTimeout(updateScreenshot, 200);
});

// 清理函数（如果需要的话）
function cleanup() {
  mutationObserver.disconnect();
  resizeObserver.disconnect();
  window.removeEventListener('resize', debouncedUpdateScreenshot);
  window.removeEventListener('scroll', debouncedUpdateScreenshot);
}

// ========== 着色器程序 ==========
// 顶点着色器源码：负责处理顶点位置变换
const vsSource = `
    precision mediump float;
    
    // 输入属性：顶点位置（四边形顶点，范围-0.5到0.5）
    attribute vec2 a_position;

    // 统一变量：从JavaScript传入的参数
    uniform vec2 u_resolution;  // 屏幕分辨率
    uniform vec2 u_mousePos;    // 玻璃中心位置（像素坐标）
    uniform vec2 u_glassSize;   // 玻璃尺寸（像素）

    // 输出变量：传递给片段着色器的插值数据
    varying vec2 v_screenTexCoord; // 屏幕纹理坐标（0-1范围）
    varying vec2 v_shapeCoord;     // 相对于玻璃中心的归一化坐标（-0.5到0.5）

    void main() {
        // 计算顶点在屏幕上的实际像素位置
        vec2 screenPos = u_mousePos + a_position * u_glassSize;
        
        // 将屏幕坐标转换为WebGL的裁剪空间坐标（-1到1）
        vec2 clipSpacePos = (screenPos / u_resolution) * 2.0 - 1.0;
        
        // 设置最终顶点位置，Y轴翻转以匹配屏幕坐标系
        gl_Position = vec4(clipSpacePos * vec2(1.0, -1.0), 0.0, 1.0);
        
        // 计算用于采样背景纹理的坐标
        v_screenTexCoord = screenPos / u_resolution;
        v_screenTexCoord.y = 1.0 - v_screenTexCoord.y; // 翻转Y轴
        
        // 传递形状坐标给片段着色器
        v_shapeCoord = a_position;
    }
`;

// 片段着色器源码：负责计算每个像素的颜色
const fsSource = `
    precision mediump float;

    // 统一变量：从JavaScript传入的参数
    uniform sampler2D u_backgroundTexture; // 背景纹理
    uniform vec2 u_resolution;             // 屏幕分辨率
    uniform vec2 u_glassSize;              // 玻璃尺寸
    uniform float u_cornerRadius;          // 圆角半径
    uniform float u_ior;                   // 折射率（Index of Refraction）
    uniform float u_glassThickness;        // 玻璃厚度
    uniform float u_normalStrength;        // 法线强度
    uniform float u_displacementScale;     // 位移缩放
    uniform float u_heightTransitionWidth; // 高度过渡宽度
    uniform float u_sminSmoothing;         // SDF平滑因子
    uniform int u_showNormals;             // 是否显示法线
    uniform float u_blurRadius;            // 模糊半径（毛玻璃效果）
    uniform vec4 u_overlayColor;           // 叠加颜色
    uniform float u_highlightWidth;        // 高光宽度

    // 从顶点着色器传入的插值变量
    varying vec2 v_screenTexCoord; // 屏幕纹理坐标
    varying vec2 v_shapeCoord;     // 形状坐标

    // 多项式平滑最小值函数（四次方）
    // k 控制混合的平滑度/半径
    float smin_polynomial(float a, float b, float k) {
        if (k <= 0.0) return min(a, b); // 避免除零或无平滑
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
    }

    // 多项式平滑最大值函数
    float smax_polynomial(float a, float b, float k) {
        if (k <= 0.0) return max(a, b);
        // return -smin_polynomial(-a, -b, k); // 替代公式
        float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
        return mix(b, a, h) + k * h * (1.0 - h); // 注意：+k 和 (a-b)
    }

    // 原始的圆角矩形SDF函数（用于参考或当k_smooth为0时）
    float sdRoundedBoxSharp(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }

    // 使用多项式smin/smax的平滑圆角矩形SDF函数
    float sdRoundedBoxSmooth(vec2 p, vec2 b, float r, float k_smooth) {
        if (k_smooth <= 0.0) { // 如果无平滑则回退到锐利版本
            return sdRoundedBoxSharp(p,b,r);
        }
        vec2 q = abs(p) - b + r;

        // 项A：max(q.x, q.y) - 这是角落定义的关键部分
        float termA_smooth = smax_polynomial(q.x, q.y, k_smooth);

        // 项B：min(termA_smooth, 0.0) - 为直边上的点钳制距离
        // 平滑这个min( , 0.0)可能很棘手。使用较小的k或无平滑可能更安全。
        // 让我们尝试为这个特定部分使用可能较小的k。
        float termB_smooth = smin_polynomial(termA_smooth, 0.0, k_smooth * 0.5); 

        // 项C：length(max(q, 0.0)) - 角落区域中点到角落中心的距离
        // max(q, 0.0) 是 vec2(max(q.x, 0.0), max(q.y, 0.0))
        vec2 q_for_length_smooth = vec2(
            smax_polynomial(q.x, 0.0, k_smooth),
            smax_polynomial(q.y, 0.0, k_smooth)
        );
        float termC_smooth = length(q_for_length_smooth);
        
        return termB_smooth + termC_smooth - r;
    }

    // 将SDF转换为高度的辅助函数
    float getHeightFromSDF(vec2 p_pixel_space, vec2 b_pixel_space, float r_pixel, float k_s, float transition_w) {
        float dist_sample = sdRoundedBoxSmooth(p_pixel_space, b_pixel_space, r_pixel, k_s);
        // 将dist_sample在过渡带内归一化到[-1, 1]
        float normalized_dist = dist_sample / transition_w;
        
        // 使用逻辑sigmoid函数在边缘处（normalized_dist=0）产生陡峭下降并趋于平缓
        // 更高的陡峭因子导致更尖锐的过渡
        const float steepness_factor = 6.0; // 这个值可以调整
        float height = 1.0 - (1.0 / (1.0 + exp(-normalized_dist * steepness_factor)));
        
        // 钳制到[0, 1]以确保保持在有效高度范围内
        return clamp(height, 0.0, 1.0);
    }

    void main() {
        float actualCornerRadius = min(u_cornerRadius, min(u_glassSize.x, u_glassSize.y) / 2.0);
        
        // 相对于玻璃中心的像素空间中的当前点
        vec2 current_p_pixel = v_shapeCoord * u_glassSize;
        vec2 glass_half_size_pixel = u_glassSize / 2.0;

        // 用于丢弃的初始SDF检查（如果k_smooth很大，可以使用锐利版本以提高效率）
        float dist_for_shape_boundary = sdRoundedBoxSmooth(current_p_pixel, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing);
        if (dist_for_shape_boundary > 0.001) { // 如果明显在过渡带外则丢弃
            discard;
        }

        vec2 pixel_step_in_norm_space = vec2(1.0 / u_glassSize.x, 1.0 / u_glassSize.y); // v_shapeCoord空间中的步长

        // 归一化形状空间（v_shapeCoord空间）中的采样步长
        float norm_step_x1 = pixel_step_in_norm_space.x * 0.75;
        float norm_step_y1 = pixel_step_in_norm_space.y * 0.75;
        float norm_step_x2 = pixel_step_in_norm_space.x * 1.5;
        float norm_step_y2 = pixel_step_in_norm_space.y * 1.5;

        // 计算X方向梯度
        // getHeightFromSDF期望像素空间坐标用于p, b, r, k_s, transition_w
        float h_px1 = getHeightFromSDF((v_shapeCoord + vec2(norm_step_x1, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_nx1 = getHeightFromSDF((v_shapeCoord - vec2(norm_step_x1, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_px2 = getHeightFromSDF((v_shapeCoord + vec2(norm_step_x2, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_nx2 = getHeightFromSDF((v_shapeCoord - vec2(norm_step_x2, 0.0)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);

        // 分母是像素距离
        float grad_x1 = (h_px1 - h_nx1) / (2.0 * norm_step_x1 * u_glassSize.x);
        float grad_x2 = (h_px2 - h_nx2) / (2.0 * norm_step_x2 * u_glassSize.x);
        float delta_x = mix(grad_x1, grad_x2, 0.5);

        // 计算Y方向梯度
        float h_py1 = getHeightFromSDF((v_shapeCoord + vec2(0.0, norm_step_y1)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_ny1 = getHeightFromSDF((v_shapeCoord - vec2(0.0, norm_step_y1)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_py2 = getHeightFromSDF((v_shapeCoord + vec2(0.0, norm_step_y2)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        float h_ny2 = getHeightFromSDF((v_shapeCoord - vec2(0.0, norm_step_y2)) * u_glassSize, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        
        float grad_y1 = (h_py1 - h_ny1) / (2.0 * norm_step_y1 * u_glassSize.y);
        float grad_y2 = (h_py2 - h_ny2) / (2.0 * norm_step_y2 * u_glassSize.y);
        float delta_y = mix(grad_y1, grad_y2, 0.5);

        vec3 surfaceNormal3D = normalize(vec3(-delta_x * u_normalStrength, -delta_y * u_normalStrength, 1.0));

        if (u_showNormals == 1) {
            gl_FragColor = vec4(surfaceNormal3D * 0.5 + 0.5, 1.0); // 从[-1,1]重映射到[0,1]用于颜色
            return;
        }

        vec3 incidentLightDir = normalize(vec3(0.0, 0.0, -1.0));
        vec3 refractedIntoGlass = refract(incidentLightDir, surfaceNormal3D, 1.0 / u_ior);
        vec3 refractedOutOfGlass = refract(refractedIntoGlass, -surfaceNormal3D, u_ior);

        vec2 offset_in_pixels = refractedOutOfGlass.xy * u_glassThickness;
        vec2 offset = (offset_in_pixels / u_resolution) * u_displacementScale;

        vec2 refractedTexCoord = v_screenTexCoord + offset;
        refractedTexCoord = clamp(refractedTexCoord, 0.001, 0.999);

        // 磨砂玻璃效果：对折射纹理应用3x3盒式模糊
        vec4 blurredColor = vec4(0.0);
        vec2 texelSize = 1.0 / u_resolution; // 纹理坐标中一个像素的大小
        float blurPixelRadius = u_blurRadius; 

        // 展开的3x3模糊采样
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0, -1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0, -1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0, -1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0,  0.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0,  0.0) * blurPixelRadius * texelSize); // 中心采样
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0,  0.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2(-1.0,  1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 0.0,  1.0) * blurPixelRadius * texelSize);
        blurredColor += texture2D(u_backgroundTexture, refractedTexCoord + vec2( 1.0,  1.0) * blurPixelRadius * texelSize);
        
        blurredColor /= 9.0; // 除以总采样数（3x3 = 9）

        // 与叠加颜色混合以使玻璃更突出
        // 这里的高度值可以用作alpha或混合因子（如果需要）
        // 对于微妙的叠加，我们可以用固定的alpha进行混合
        float height_val = getHeightFromSDF(current_p_pixel, glass_half_size_pixel, actualCornerRadius, u_sminSmoothing, u_heightTransitionWidth);
        vec4 finalColor = mix(blurredColor, u_overlayColor, height_val * 0.15); // 调整0.15以获得所需的不透明度
        
        // 在最终颜色上应用高光
        float highlight_dist = abs(dist_for_shape_boundary);
        // 高光在highlight_dist = 0.0时最强，向u_highlightWidth淡出
        float highlight_alpha = 1.0 - smoothstep(0.0, u_highlightWidth, highlight_dist);
        highlight_alpha = max(0.0, highlight_alpha); // 确保不为负数

        // 基于法线的方向性高光
        // 我们希望当surfaceNormal3D.x和surfaceNormal3D.y符号相同时高光更强
        // 这对应于指向左上角（-x, -y）或右下角（+x, +y）边缘的法线
        float directionalFactor = (surfaceNormal3D.x * surfaceNormal3D.y + 1.0) * 0.5; // 缩放从0到1
        // 如果高光太微妙，你可以为这个因子添加增强
        // directionalFactor = pow(directionalFactor, 0.5); // 示例：应用幂次进行非线性控制
        
        float finalHighlightAlpha = highlight_alpha * directionalFactor;
        
        gl_FragColor = mix(finalColor, vec4(1.0, 1.0, 1.0, 1.0), finalHighlightAlpha);
    }
`;

// ========== WebGL 着色器和程序设置 ==========
/**
 * 创建并编译着色器的辅助函数
 * @param {WebGLRenderingContext} gl - WebGL上下文
 * @param {number} type - 着色器类型（顶点或片段着色器）
 * @param {string} source - 着色器源代码
 * @returns {WebGLShader|null} 编译后的着色器对象
 */
function createShader(gl, type, source) {
  // 创建着色器对象
  const shader = gl.createShader(type);

  // 设置着色器源代码
  gl.shaderSource(shader, source);

  // 编译着色器
  gl.compileShader(shader);

  // 检查编译是否成功
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      `Shader compile error (${type === gl.VERTEX_SHADER ? "VS" : "FS"}):`,
      gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// 创建玻璃效果的着色器
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

// 创建着色器程序并链接着色器
const program = gl.createProgram();
gl.attachShader(program, vertexShader); // 附加顶点着色器
gl.attachShader(program, fragmentShader); // 附加片段着色器
gl.linkProgram(program); // 链接程序

// 检查程序链接是否成功
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Program link error:", gl.getProgramInfoLog(program));
  throw new Error("Program link error");
}

// ========== 获取着色器变量位置 ==========
// 获取玻璃着色器程序中的attribute和uniform变量位置
// 这些位置用于后续向着色器传递数据
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const resolutionUniformLocation = gl.getUniformLocation(
  program,
  "u_resolution"
);
const mousePosUniformLocation = gl.getUniformLocation(program, "u_mousePos");
const glassSizeUniformLocation = gl.getUniformLocation(program, "u_glassSize");
const backgroundTextureUniformLocation = gl.getUniformLocation(
  program,
  "u_backgroundTexture"
);
const cornerRadiusUniformLocation = gl.getUniformLocation(
  program,
  "u_cornerRadius"
);
const iorUniformLocation = gl.getUniformLocation(program, "u_ior");
const glassThicknessUniformLocation = gl.getUniformLocation(
  program,
  "u_glassThickness"
);
const normalStrengthUniformLocation = gl.getUniformLocation(
  program,
  "u_normalStrength"
);
const displacementScaleUniformLocation = gl.getUniformLocation(
  program,
  "u_displacementScale"
);
const heightTransitionWidthUniformLocation = gl.getUniformLocation(
  program,
  "u_heightTransitionWidth"
);
const sminSmoothingUniformLocation = gl.getUniformLocation(
  program,
  "u_sminSmoothing"
);
const showNormalsUniformLocation = gl.getUniformLocation(
  program,
  "u_showNormals"
);
const blurRadiusUniformLocation = gl.getUniformLocation(
  program,
  "u_blurRadius"
);
const overlayColorUniformLocation = gl.getUniformLocation(
  program,
  "u_overlayColor"
);
const highlightWidthUniformLocation = gl.getUniformLocation(
  program,
  "u_highlightWidth"
);

// ========== 几何体数据设置 ==========
// 玻璃四边形的顶点坐标（两个三角形组成一个矩形）
// 坐标范围从-0.5到0.5，后续会在着色器中缩放到实际尺寸
const positions = [
  -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
];
const positionBuffer = gl.createBuffer(); // 创建顶点缓冲区
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // 绑定缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // 上传顶点数据

// ========== 纹理设置 ==========
// 创建背景纹理对象
let backgroundTextureGL = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, backgroundTextureGL);

// 创建一个1x1像素的透明占位纹理，在真实图片加载前使用
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

// 设置纹理参数
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // S轴（水平）边缘处理
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // T轴（垂直）边缘处理
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // 缩小时的过滤方式
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // 放大时的过滤方式

// ========== 页面截图功能 ==========
/**
 * 截取玻璃容器覆盖的页面区域
 */
async function updateScreenshot() {
  try {
    // 获取玻璃容器的位置和尺寸
    const rect = glassContainer.getBoundingClientRect();

    // 使用html2canvas截取整个页面
    const fullPageCanvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // 设置截图canvas的尺寸
    screenshotCanvas.width = glassWidth;
    screenshotCanvas.height = glassHeight;

    // 获取截图canvas的2D上下文
    const ctx = screenshotCanvas.getContext("2d");

    // 从完整页面截图中提取玻璃覆盖的区域
    ctx.drawImage(
      fullPageCanvas,
      rect.left,
      rect.top,
      glassWidth,
      glassHeight, // 源区域
      0,
      0,
      glassWidth,
      glassHeight // 目标区域
    );

    // 将截图上传到WebGL纹理
    gl.bindTexture(gl.TEXTURE_2D, backgroundTextureGL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      screenshotCanvas
    );

    // 设置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  } catch (error) {
    console.error("截图失败:", error);
  }
}

// 初始截图
setTimeout(() => {
  updateScreenshot();
}, 100); // 延迟一点确保页面完全加载

// ========== 渲染循环 ==========
/**
 * 主渲染函数：每帧调用一次，负责绘制整个场景
 */
function render() {
  // 设置画布尺寸为玻璃容器大小
  canvas.width = glassWidth;
  canvas.height = glassHeight;

  // 设置WebGL视口（渲染区域）
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 设置清除颜色为透明，并清除颜色缓冲区
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // ========== 绘制玻璃效果 ==========
  // 使用玻璃效果着色器程序
  gl.useProgram(program);

  // 绑定玻璃四边形的顶点缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // 向着色器传递各种参数
  gl.uniform2f(resolutionUniformLocation, glassWidth, glassHeight); // 玻璃分辨率
  gl.uniform2f(mousePosUniformLocation, glassWidth / 2, glassHeight / 2); // 玻璃中心（相对于自身）
  gl.uniform2f(glassSizeUniformLocation, glassWidth, glassHeight); // 玻璃尺寸
  gl.uniform1f(cornerRadiusUniformLocation, cornerRadius); // 圆角半径
  gl.uniform1f(iorUniformLocation, ior); // 折射率
  gl.uniform1f(glassThicknessUniformLocation, glassThickness); // 玻璃厚度
  gl.uniform1f(normalStrengthUniformLocation, normalStrength); // 法线强度
  gl.uniform1f(displacementScaleUniformLocation, displacementScale); // 位移缩放
  gl.uniform1f(heightTransitionWidthUniformLocation, heightBlurFactor); // 高度过渡宽度
  gl.uniform1f(sminSmoothingUniformLocation, sminSmoothing); // SDF平滑因子
  gl.uniform1i(showNormalsUniformLocation, showNormals ? 1 : 0); // 是否显示法线
  gl.uniform1f(blurRadiusUniformLocation, blurRadius); // 模糊半径
  gl.uniform4f(overlayColorUniformLocation, 1.0, 1.0, 1.0, 1.0); // 叠加颜色（白色）
  gl.uniform1f(highlightWidthUniformLocation, highlightWidth); // 高光宽度

  // 绑定截图纹理供玻璃着色器使用（用于折射效果）
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, backgroundTextureGL);
  gl.uniform1i(backgroundTextureUniformLocation, 0);

  // 绘制玻璃效果（6个顶点组成2个三角形）
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // 请求下一帧动画（创建渲染循环）
  requestAnimationFrame(render);
}

render();
