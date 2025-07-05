import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import bgImg from "./128-1600x900.jpg";

// Fixed poetry content
const poetryText = `Lorem
Ipsum`;

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
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      {/* Scrollable poetry content */}
      <div
        style={{
          position: "relative",
          fontSize: "150px",
          lineHeight: "1.2",
          color: "white",
          fontFamily: "Georgia, serif",
          whiteSpace: "pre-line",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: "400px",
          // textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
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
    borderRadius: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
    enableWebGL: {
      control: { type: "boolean" },
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    children: <div style={{ padding: "135px 200px" }}></div>,
  },
};
