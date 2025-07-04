import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";

// Fixed poetry content
const poetryText = `From fairest creatures we desire increase
That thereby beauty's rose might never die
But as the riper should by time decease
His tender heir might bear his memory
But thou contracted to thine own bright eyes
Feed'st thy light's flame with self-substantial fuel
Making a famine where abundance lies
Thy self thy foe, to thy sweet self too cruel
Thou that art now the world's fresh ornament
And only herald to the gaudy spring
Within thine own bud buriest thy content
And tender churl mak'st waste in niggarding
Pity the world, or else this glutton be
To eat the world's due, by the grave and thee`;

// Global variable to store random image ID, avoiding repeated loading
let globalRandomImageId: number | null = null;

// Background decorator
const BackgroundDecorator = (Story: any) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#f1f1f1",
        backgroundImage: `linear-gradient(90deg, transparent 50px, #ffb4b8 50px, #ffb4b8 52px, transparent 52px), linear-gradient(#e1e1e1 0.1em, transparent 0.1em)`,
        backgroundSize: "100% 30px",
        overflow: "hidden",
      }}
    >
      {/* Scrollable poetry content */}
      <div
        style={{
          position: "relative",
          fontSize: "27px",
          lineHeight: "1.8",
          color: "black",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          whiteSpace: "pre-line",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: "400px",
        }}
      >
        <div>{poetryText}</div>
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
      control: { type: "range", min: 0, max: 100, step: 1 },
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

export const Demo: Story = {
  args: {
    children: <div style={{ padding: "135px 200px" }}></div>,
  },
};
