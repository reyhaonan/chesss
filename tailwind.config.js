// import daisyui from "daisyui"
const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,ts,svelte}'],
	purge: ['./src/**/*.{svelte,js,ts}'],

	daisyui: {
		themes: [
			{
				chessTheme: {
					...require('daisyui/src/theming/themes')['dark'],
					primary: '#9fd7b3',
					secondary: '#335c79',
					accent: '#6b7ec1',
					neutral: '#ddf1e3',
					'base-100': '#09160d',
					info: '#ffffff',
					success: '#00ffff',
					warning: '#ffffff',
					error: '#ffffff'
				}
			}
		]
	},
	theme: {
		extend: {
			fontFamily:{
				'sans': ['Roboto Condensed', ...defaultTheme.fontFamily.sans]
			},
			colors: {
				// https://www.realtimecolors.com/?colors=ddf1e3-09160d-9fd7b3-335c79-6b7ec1&fonts=Poppins-Poppins
				textColor: '#ddf1e3',
				background: '#09160d',
				primary: '#9fd7b3',
				secondary: '#335c79',
				accent: '#6b7ec1'
			}
		}
	},
	// plugins: [(daisyui)],
	plugins: [require('daisyui')],
	darkmode: 'class'
};
