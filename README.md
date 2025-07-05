# React Premium Glass

[English](README.md) | [中文](README_zh.md)

A high-quality React glassmorphism GlassCard component

![image](https://github.com/user-attachments/assets/c7e3d47b-d68c-426f-b299-2980cdadf38f)

## Features

- 🎨 **Modern Design** - Based on the latest glassmorphism design trends
- 🔧 **TypeScript Support** - Complete type definitions
- 📱 **Responsive Design** - Adapts to various screen sizes
- 🎯 **Easy to Use** - Clean API design
- 📚 **Storybook Documentation** - Interactive component documentation

## Installation

```bash
npm install react-premium-glass
```

## Quick Start

```tsx
import { GlassCard } from "react-premium-glass";

function App() {
  return (
    <div
      style={{
        background: "#212121",
      }}
    >
      <GlassCard
        enableWebGL={true}
        style={{
          borderRadius: "100px",
          color: "white"
        }}
      >
        <h2>Welcome to React Premium Glass</h2>
        <p>This is a beautiful glassmorphism card component</p>
      </GlassCard>
    </div>
  );
}
```

## Components

### GlassCard

```tsx
<GlassCard
  enableWebGL={true}
>
  <p>Card content</p>
</GlassCard>
```

## API Reference

### GlassCard Props

| Prop         | Type             | Default | Description           |
| ------------ | --------------- | ------- | -------------------- |
| enableWebGL  | `boolean`       | `true`  | Enable WebGL refraction effect |
| className    | `string`        | -       | Custom CSS class name |
| style        | `CSSProperties` | -       | Custom styles         |
| children     | `ReactNode`     | -       | Child elements        |

## Development

```bash
# Install dependencies
npm install

# Start Storybook development server
npm run dev

# Build component library
npm run build

# Code linting
npm run lint
```

## Build and Publish

```bash
# Build
npm run build

# Publish to npm
npm publish
```

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

## Changelog

### 0.0.1-alpha

- Initial release
- Includes GlassCard component
- Complete TypeScript support
- Storybook documentation
