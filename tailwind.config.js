/**
 * Tailwind CSS Configuration
 * 
 * This file serves as a reference for the Tailwind configuration.
 * The actual configuration is used in the inline script in our HTML files
 * since we're using the Tailwind CDN approach.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'stripe-purple': '#5469d4',
        'stripe-dark': '#32325d',
        'stripe-light': '#f6f9fc',
        'error-red': '#fa755a',
      }
    },
  },
  plugins: [],
} 