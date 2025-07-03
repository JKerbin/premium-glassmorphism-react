import type { Preview } from "@storybook/react";
import "../src/styles/glass.scss";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "gradient",
      values: [
        {
          name: "gradient",
          value:
            "radial-gradient(circle at 60% 60%, white 0%, #eee 30%, #aaa 100%)",
        },
        {
          name: "dark",
          value: "#1a1a1a",
        },
        {
          name: "light",
          value: "#f0f0f0",
        },
      ],
    },
  },
};

export default preview;
