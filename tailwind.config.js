/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:    '#5EBFB5',
        background: '#F5F2EA',
        surface:    '#FFFFFF',
        foreground: '#0A0A0A',
        muted:      '#6B6760',
        border:     '#E5E0D5',
        accent:     '#B8D4C9',
        warning:    '#E89B7E',
        danger:     '#C45A3D',
      },
    },
  },
  plugins: [],
};
