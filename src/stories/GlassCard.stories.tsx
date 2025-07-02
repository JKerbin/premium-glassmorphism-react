import type { Meta, StoryObj } from '@storybook/react';
import GlassCard from '../components/GlassCard';

const meta: Meta<typeof GlassCard> = {
  title: 'Components/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['light', 'dark', 'colored', 'gradient'],
    },
    blur: {
      control: { type: 'range', min: 0, max: 50, step: 1 },
    },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
    borderRadius: {
      control: { type: 'range', min: 0, max: 50, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: '20px' }}>
        <h3>Glass Card</h3>
        <p>This is a beautiful glassmorphism card component.</p>
      </div>
    ),
  },
};

export const Light: Story = {
  args: {
    variant: 'light',
    children: (
      <div style={{ padding: '20px' }}>
        <h3>Light Glass Card</h3>
        <p>A light variant of the glass card.</p>
      </div>
    ),
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    children: (
      <div style={{ padding: '20px' }}>
        <h3>Dark Glass Card</h3>
        <p>A dark variant of the glass card.</p>
      </div>
    ),
  },
};

export const Colored: Story = {
  args: {
    variant: 'colored',
    children: (
      <div style={{ padding: '20px' }}>
        <h3>Colored Glass Card</h3>
        <p>A colored variant of the glass card.</p>
      </div>
    ),
  },
};

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: (
      <div style={{ padding: '20px' }}>
        <h3>Gradient Glass Card</h3>
        <p>A gradient variant of the glass card.</p>
      </div>
    ),
  },
};
