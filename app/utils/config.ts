// Global configuration

export type Theme = "default" | "halloween" | "spring" | "summer" | "xmas";

export const SITE_TITLE = "Salvatore Laisa";
export const SITE_DESCRIPTION = "Blog personale.";
export const CURRENT_THEME: Theme = "default";
export const EVENTS = {
	xmas: {
		name: "🎁",
		href: "/events/xmas",
		title: "Contenuti speciali natalizi",
	},
	halloween: {
		name: "🎃",
		href: "/events/halloween",
		title: "Contenuti speciali di Halloween",
	},
	earthDay: {
		name: "🌍",
		href: "https://www.earthday.org/earth-day-2026/",
		title: "Giornata della terra 2026",
		external: true,
	},
};
export const SEASON_EMOJI = CURRENT_THEME === "summer" ? "🌤️🏖️" : "";
export const PINNED_POST_DESCRIPTION =
	"Questo post è stato messo in evidenza perché potrebbe essere stato aggiornato di recente o per qualche contesto attuale.";
