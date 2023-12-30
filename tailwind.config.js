import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ["class"],
	content: ["./src/**/*.{html,js,svelte,ts}"],
  safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			colors: {
				border: "var(--border) / <alpha-value>",
				input: "var(--input) / <alpha-value>",
				ring: "var(--ring) / <alpha-value>",
				background: "var(--background) / <alpha-value>",
				foreground: "var(--foreground) / <alpha-value>",
				primary: {
					DEFAULT: "var(--primary) / <alpha-value>",
					foreground: "var(--primary-foreground) / <alpha-value>"
				},
				secondary: {
					DEFAULT: "var(--secondary) / <alpha-value>",
					foreground: "var(--secondary-foreground) / <alpha-value>"
				},
				destructive: {
					DEFAULT: "var(--destructive) / <alpha-value>",
					foreground: "var(--destructive-foreground) / <alpha-value>"
				},
				muted: {
					DEFAULT: "var(--muted) / <alpha-value>",
					foreground: "var(--muted-foreground) / <alpha-value>"
				},
				accent: {
					DEFAULT: "var(--accent) / <alpha-value>",
					foreground: "var(--accent-foreground) / <alpha-value>"
				},
				popover: {
					DEFAULT: "var(--popover) / <alpha-value>",
					foreground: "var(--popover-foreground) / <alpha-value>"
				},
				card: {
					DEFAULT: "var(--card) / <alpha-value>",
					foreground: "var(--card-foreground) / <alpha-value>"
				}
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			}
		}
	},
};

export default config;
