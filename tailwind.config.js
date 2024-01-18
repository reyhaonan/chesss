/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{html,js,ts,svelte}'],
	purge: ['./index.html', './src/**/*.{svelte,js,ts}'],
	theme: {
		extend: {
			colors: {
				// https://www.realtimecolors.com/?colors=ddf1e3-09160d-9fd7b3-335c79-6b7ec1&fonts=Poppins-Poppins
				textColor:"#ddf1e3",
				background: "#09160d",
				primary: "#9fd7b3",
				secondary: "#335c79",
				accent: "#6b7ec1",
			}
		}
	},
	plugins: [],
	darkmode: 'class'
};
