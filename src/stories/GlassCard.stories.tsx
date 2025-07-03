import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";

// Fixed poetry content
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

// Global variable to store random image ID, avoiding repeated loading
let globalRandomImageId: number | null = null;

// Background decorator
const BackgroundDecorator = (Story: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate random ID only on first load
  if (globalRandomImageId === null) {
    globalRandomImageId = Math.floor(Math.random() * 1000);
  }

  const imageUrl = `https://picsum.photos/seed/${globalRandomImageId}/1600/900`;

  // Preload image
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
        overflow: "hidden", // Hide container scrollbars
      }}
    >
      {/* Background image layer */}
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

      {/* Scrollable poetry content */}
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
          whiteSpace: "pre-line", // Preserve line break formatting
          overflow: "auto", // Only content area can scroll
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

      {/* Fixed position GlassCard */}
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
    layout: "fullscreen", // Change to fullscreen layout
  },
  decorators: [BackgroundDecorator], // Add background decorator
  tags: ["autodocs"],
  argTypes: {
    blur: {
      control: { type: "range", min: 0, max: 50, step: 1 },
    },
    borderRadius: {
      control: { type: "range", min: 0, max: 50, step: 1 },
    },
    enableWebGL: {
      control: { type: "boolean" },
    },
    ior: {
      control: { type: "range", min: 1.0, max: 2.0, step: 0.1 },
    },
    glassThickness: {
      control: { type: "range", min: 10, max: 100, step: 1 },
    },
    normalStrength: {
      control: { type: "range", min: 0, max: 20, step: 0.1 },
    },
    displacementScale: {
      control: { type: "range", min: 0, max: 3, step: 0.1 },
    },
    heightBlurFactor: {
      control: { type: "range", min: 1, max: 20, step: 0.1 },
    },
    sminSmoothing: {
      control: { type: "range", min: 0, max: 50, step: 1 },
    },
    highlightWidth: {
      control: { type: "range", min: 0, max: 10, step: 0.1 },
    },
    showNormals: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: "70px 200px" }}>
      </div>
    ),
  },
};
