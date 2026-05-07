/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:    '#5EBFB5',
        background: '#0A0A0A',
        surface:    '#171717',
        foreground: '#F5F2EA',
        muted:      '#6B6760',
        border:     '#2A2A2A',
        accent:     '#B8D4C9',
        warning:    '#E89B7E',
        danger:     '#C45A3D',
        action:     '#E89B7E',
        actionDeep: '#D97A5C',
      },
    },
  },
  plugins: [],
};
