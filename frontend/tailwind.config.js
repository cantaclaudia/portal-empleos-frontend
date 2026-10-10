export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F46036',
          dark: '#d9512e',
          light: '#fff3ec',
        },
        navy: {
          DEFAULT: '#06083C',
          light: '#1E2749',
        },
        accent: '#3351a6',
        surface: '#eceef6',
        page: '#efefef',
      },
      fontFamily: {
        sans: ['Nunito', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};