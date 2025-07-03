/**
 * 获取玻璃态效果的CSS类名
 */
export const getGlassClasses = (
  blur: number = 10,
  borderRadius: number = 12,
  border: boolean = true,
  shadow: boolean = true
): string => {
  const classes = ['glass-card'];
  
  // 添加边框类
  if (border) {
    classes.push('glass-border');
  }
  
  // 添加阴影类
  if (shadow) {
    classes.push('glass-shadow');
  }
  
  // 根据模糊值添加对应类
  if (blur === 5) classes.push('glass-blur-5');
  else if (blur === 15) classes.push('glass-blur-15');
  else if (blur === 20) classes.push('glass-blur-20');
  else classes.push('glass-blur-10'); // 默认
  
  // 根据圆角值添加对应类
  if (borderRadius <= 6) classes.push('glass-rounded-sm');
  else if (borderRadius <= 18) classes.push('glass-rounded-lg');
  else if (borderRadius <= 24) classes.push('glass-rounded-xl');
  else classes.push('glass-rounded-md'); // 默认
  
  return classes.join(' ');
};

/**
 * 获取玻璃态的默认样式配置
 */
export const getGlassVariants = () => ({
  background: "rgba(255, 255, 255, 0)",
  borderColor: "rgba(255, 255, 255, 0.2)",
});

/**
 * 创建自定义CSS变量样式对象
 */
export const createGlassStyle = (
  blur?: number,
  borderRadius?: number
): Record<string, string> => {
  const style: Record<string, string> = {};
  
  // 设置自定义模糊值（如果不是标准值）
  if (blur && ![5, 10, 15, 20].includes(blur)) {
    style['--glass-blur'] = `${blur}px`;
  }
  
  // 设置自定义圆角值（如果不是标准值）
  if (borderRadius && ![6, 12, 18, 24].includes(borderRadius)) {
    style['--glass-border-radius'] = `${borderRadius}px`;
  }
  
  return style;
};
