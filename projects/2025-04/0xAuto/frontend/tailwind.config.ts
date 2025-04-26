import type { Config } from "tailwindcss";
import daisyui from "daisyui"; // Import daisyui

const config: Config = {
  content: [
    // Keep existing content paths
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: { // Add fontFamily extension
        sans: ['var(--font-geist-sans)'], // Keep existing sans
        mono: ['var(--font-geist-mono)'], // Keep existing mono
        pixel: ['var(--font-pixel)', 'monospace'], // Add pixel font utility
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    daisyui, // Use the imported plugin
  ],
  // daisyUI config moved inside the plugin call if needed,
  // but often default themes are sufficient initially or configured elsewhere.
  // For explicit theme config *within* tailwind.config.ts (less common now):
  // plugins: [
  //   require("daisyui")({
  //     themes: ["light", "dark"],
  //   }),
  // ],
  // Let's stick to the simpler plugin registration for now.
  // We can add specific theme config later if needed.
  daisyui: {
    themes: [
      "light", // Include the default light theme
      {
        cyberpunk: { // Target the built-in 'cyberpunk' theme
          "primary": "#a855f7",        // Override primary color (Tailwind purple-500)
          "primary-focus": "#9333ea",   // Override focus color (Tailwind purple-600)
          "primary-content": "#ffffff", // Ensure text on primary is readable
          // cyberpunk already has a dark base, secondary, accent etc.
          // Add other overrides if needed
        },
      },
    ], // Explicitly list themes to use
    darkTheme: "cyberpunk", // Keep cyberpunk as the default dark theme if desired
    base: true,
    styled: true,
    utils: true,
    logs: true,
  },
};
export default config;
