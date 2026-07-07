/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: "#7C3AED",
          fonce: "#5B21B6",
          clair: "#8B5CF6",
        },
        lavande: "#F4F0FC",
        encre: "#141019",
        ardoise: "#6C6579",
        ligne: "#ECE8F1",
      },
      fontFamily: {
        titre: ['Poppins', 'system-ui', 'sans-serif'],
        corps: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        monter: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        apparaitre: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        clignote: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'glisser-haut': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ring-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        monter: "monter .55s cubic-bezier(.22,1,.36,1) both",
        apparaitre: "apparaitre .5s ease both",
        clignote: 'clignote 0.9s step-end infinite',
        'glisser-haut': 'glisser-haut 0.6s cubic-bezier(.22,1,.36,1) both',
        'ring-pulse': 'ring-pulse 1.2s cubic-bezier(.22,1,.36,1) 0.5s 1 forwards',
      },
    },
  },
  plugins: [],
}
