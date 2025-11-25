/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            fontFamily: {
                inter: ['var(--font-inter)'],
                montserrat: ['var(--font-montserrat)'],
                playfair: ['var(--font-playfair)'],
                oswald: ['var(--font-oswald)'],
                poppins: ['var(--font-poppins)'],
                merriweather: ['var(--font-merriweather)'],
                anton: ['var(--font-anton)'],
                cormorant: ['var(--font-cormorant)'],
                lilita: ['var(--font-lilita)'],
                space: ['var(--font-space-mono)'],
                // Nuevas fuentes
                harlow: ['"Harlow Solid Italic"', 'cursive'],
                curlz: ['"Curlz MT"', 'cursive'],
                baguet: ['"Baguet Script"', 'cursive'],
                cascadia: ['"Cascadia Mono ExtraLight"', 'monospace'],
                varsity: ['"Varsity Regular"', 'sans-serif'],
                freshman: ['"Freshman"', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
