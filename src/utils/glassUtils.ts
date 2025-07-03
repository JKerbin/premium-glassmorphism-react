/**
 * Get CSS class names for glass effect
 */
export const getGlassClasses = (
  blur: number = 10,
  borderRadius: number = 12,
  border: boolean = true,
  shadow: boolean = true
): string => {
  const classes = ["glass-card"];

  // Add border class
  if (border) {
    classes.push("glass-border");
  }

  // Add shadow class
  if (shadow) {
    classes.push("glass-shadow");
  }

  // Add blur class based on blur value
  if (blur === 5) classes.push("glass-blur-5");
  else if (blur === 15) classes.push("glass-blur-15");
  else if (blur === 20) classes.push("glass-blur-20");
  else classes.push("glass-blur-10"); // default

  // Add border radius class based on borderRadius value
  if (borderRadius <= 6) classes.push("glass-rounded-sm");
  else if (borderRadius <= 18) classes.push("glass-rounded-lg");
  else if (borderRadius <= 24) classes.push("glass-rounded-xl");
  else classes.push("glass-rounded-md"); // default

  return classes.join(" ");
};

/**
 * Get default glass style configuration
 */
export const getGlassVariants = () => ({
  background: "rgba(255, 255, 255, 0)",
  borderColor: "rgba(255, 255, 255, 0.2)",
});

/**
 * Create custom CSS variables style object
 */
export const createGlassStyle = (
  blur?: number,
  borderRadius?: number
): Record<string, string> => {
  const style: Record<string, string> = {};

  // Set custom blur if not standard values
  if (blur && ![5, 10, 15, 20].includes(blur)) {
    style["--glass-blur"] = `${blur}px`;
  }

  // Set custom border radius if not standard values
  if (borderRadius && ![6, 12, 18, 24].includes(borderRadius)) {
    style["--glass-border-radius"] = `${borderRadius}px`;
  }

  return style;
};
