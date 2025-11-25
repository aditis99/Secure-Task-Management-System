module.exports = {
  content: ['./apps/dashboard/src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
