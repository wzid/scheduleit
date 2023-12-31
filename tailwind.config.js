/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				glacier: {
					50: '#f4f8fb',
					100: '#e8f0f6',
					200: '#ccdfeb',
					300: '#a0c6d9',
					400: '#86b6ce',
					500: '#4a8bad',
					600: '#387191',
					700: '#2e5a76',
					800: '#294d63',
					900: '#274253',
					950: '#1a2a37'
				}
			}
		}
	},
	plugins: []
};
