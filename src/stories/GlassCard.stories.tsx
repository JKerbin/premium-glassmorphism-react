import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";

// 固定的诗歌内容
const poetryText = `In shadows deep where silence dwells
The moonlight dances on the hills
Through whispered winds and ancient trees
Time flows like rivers to the seas

Stars paint stories in the night
Dreams take wing in silver flight
Morning dew on petals bright
Nature's canvas, pure delight

Gentle waves kiss sandy shores
Love opens all forgotten doors
Hearts that beat in rhythm true
Find their peace in morning dew

Clouds drift by on summer days
Through the golden sunset's rays
Birds sing songs of joy and grace
In this quiet, sacred space

Flowers bloom in colors bold
Stories waiting to be told
Life unfolds in moments small
Beauty lives within us all

Seasons change with gentle care
Magic floats upon the air
Hope springs forth from winter's end
New beginnings round each bend

In shadows deep where silence dwells
The moonlight dances on the hills
Through whispered winds and ancient trees
Time flows like rivers to the seas

Stars paint stories in the night
Dreams take wing in silver flight
Morning dew on petals bright
Nature's canvas, pure delight

Gentle waves kiss sandy shores
Love opens all forgotten doors
Hearts that beat in rhythm true
Find their peace in morning dew

Clouds drift by on summer days
Through the golden sunset's rays
Birds sing songs of joy and grace
In this quiet, sacred space

Flowers bloom in colors bold
Stories waiting to be told
Life unfolds in moments small
Beauty lives within us all

Seasons change with gentle care
Magic floats upon the air
Hope springs forth from winter's end
New beginnings round each bend

In shadows deep where silence dwells
The moonlight dances on the hills
Through whispered winds and ancient trees
Time flows like rivers to the seas

Stars paint stories in the night
Dreams take wing in silver flight
Morning dew on petals bright
Nature's canvas, pure delight

Gentle waves kiss sandy shores
Love opens all forgotten doors
Hearts that beat in rhythm true
Find their peace in morning dew

Clouds drift by on summer days
Through the golden sunset's rays
Birds sing songs of joy and grace
In this quiet, sacred space

Flowers bloom in colors bold
Stories waiting to be told
Life unfolds in moments small
Beauty lives within us all

Seasons change with gentle care
Magic floats upon the air
Hope springs forth from winter's end
New beginnings round each bend`;

// 全局变量存储随机图片ID，避免重复加载
let globalRandomImageId: number | null = null;

// 背景装饰器
const BackgroundDecorator = (Story: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // 只在第一次加载时生成随机ID
  if (globalRandomImageId === null) {
    globalRandomImageId = Math.floor(Math.random() * 1000);
  }
  
  const imageUrl = `https://picsum.photos/seed/${globalRandomImageId}/1600/900`;
  
  // 预加载图片
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden", // 隐藏容器的滚动条
      }}
    >
      {/* 背景图片层 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 1s ease-in-out",
        }}
      />
      
      {/* 可滚动的诗歌内容 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "60px 40px",
          fontSize: "18px",
          lineHeight: "1.8",
          color: "rgba(255, 255, 255, 0.9)",
          textShadow: "0 2px 4px rgba(0,0,0,0.7)",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          whiteSpace: "pre-line", // 保持换行格式
          overflow: "auto", // 只有内容区域可以滚动
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 0 auto",
          }}
        >
          {poetryText}
        </div>
      </div>

      {/* 固定位置的 GlassCard */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      >
        <Story />
      </div>
    </div>
  );
};

const meta: Meta<typeof GlassCard> = {
  title: "Components/GlassCard",
  component: GlassCard,
  parameters: {
    layout: "fullscreen", // 改为全屏布局
  },
  decorators: [BackgroundDecorator], // 添加背景装饰器
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["light", "dark", "colored", "gradient"],
    },
    blur: {
      control: { type: "range", min: 0, max: 50, step: 1 },
    },
    opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
    },
    borderRadius: {
      control: { type: "range", min: 0, max: 50, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "light",
    children: (
      <div style={{ padding: "20px" }}>
        <h3>Glass Card</h3>
        <p>This is a beautiful glassmorphism card component.</p>
      </div>
    ),
  },
};
