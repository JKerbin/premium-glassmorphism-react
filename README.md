# React Premium Glass

一个高质量的 React 玻璃态效果组件库，提供现代化的毛玻璃（Glassmorphism）UI 组件。

## 特性

- 🎨 **现代设计** - 基于最新的玻璃态设计趋势
- 🔧 **TypeScript 支持** - 完整的类型定义
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🎯 **易于使用** - 简洁的 API 设计
- 🧪 **完整测试** - 单元测试覆盖
- 📚 **Storybook 文档** - 交互式组件文档

## 安装

```bash
npm install react-premium-glass
# 或
yarn add react-premium-glass
# 或
pnpm add react-premium-glass
```

## 快速开始

```tsx
import { GlassCard, GlassButton } from 'react-premium-glass';

function App() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <GlassCard variant="light" blur={10} opacity={0.1}>
        <h2>欢迎使用 React Premium Glass</h2>
        <p>这是一个美丽的玻璃态卡片组件</p>
        <GlassButton variant="colored" onClick={() => alert('点击了按钮!')}>
          点击我
        </GlassButton>
      </GlassCard>
    </div>
  );
}
```

## 组件

### GlassCard

基础的玻璃态卡片组件。

```tsx
<GlassCard 
  variant="light" 
  blur={10} 
  opacity={0.1}
  borderRadius={12}
  border={true}
  shadow={true}
>
  <p>卡片内容</p>
</GlassCard>
```

### GlassButton

玻璃态按钮组件。

```tsx
<GlassButton 
  variant="colored"
  size="medium"
  onClick={() => console.log('clicked')}
>
  按钮文本
</GlassButton>
```

### GlassInput

玻璃态输入框组件。

```tsx
<GlassInput 
  placeholder="请输入内容"
  value={value}
  onChange={setValue}
  variant="light"
/>
```

### GlassModal

玻璃态模态框组件。

```tsx
<GlassModal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="模态框标题"
>
  <p>模态框内容</p>
</GlassModal>
```

## API 参考

### 通用属性 (GlassProps)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| variant | `'light' \| 'dark' \| 'colored' \| 'gradient'` | `'light'` | 玻璃效果变体 |
| blur | `number` | `10` | 模糊程度 (px) |
| opacity | `number` | `0.1` | 背景透明度 |
| borderRadius | `number` | `12` | 圆角大小 (px) |
| border | `boolean` | `true` | 是否显示边框 |
| shadow | `boolean` | `true` | 是否显示阴影 |
| background | `string` | - | 自定义背景色 |
| className | `string` | - | 自定义 CSS 类名 |
| style | `CSSProperties` | - | 自定义样式 |

## 开发

```bash
# 安装依赖
npm install

# 启动 Storybook 开发服务器
npm run dev

# 构建组件库
npm run build

# 代码检查
npm run lint
```

## 构建和发布

```bash
# 构建
npm run build

# 发布到 npm
npm publish
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### 1.0.0
- 初始版本发布
- 包含 GlassCard、GlassButton、GlassInput、GlassModal 组件
- 完整的 TypeScript 支持
- Storybook 文档
