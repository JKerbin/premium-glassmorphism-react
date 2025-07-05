import type { Preview } from "@storybook/react";
import "../src/assets/glass.scss";

// @ts-ignore
import bgImg from "./128-1600x700.jpg";

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
      default: "photo",
      values: [
        {
          name: "photo",
          value: `url(${bgImg})`,
        },
        {
          name: "pure",
          value: "#212121",
        },
      ],
    },
  },
};

export default preview;
