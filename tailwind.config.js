/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				royalblue: {
					50: '#eef4ff',
					100: '#e1eafe',
					200: '#c8d9fd',
					300: '#a7befa',
					400: '#849bf5',
					500: '#6678ee',
					600: '#545ce3',
					700: '#3b40c7',
					800: '#3339a0',
					900: '#30367f',
					950: '#1c1e4a'
				}
			}
		}
	},
	plugins: []
};
