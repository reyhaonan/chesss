/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{html,js,ts,svelte}'],
	purge: ['./index.html', './src/**/*.{svelte,js,ts}'],
	theme: {
		extend: {}
	},
	plugins: [],
	darkmode: 'class'
};
