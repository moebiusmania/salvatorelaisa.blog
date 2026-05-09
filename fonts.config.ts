export interface FontFamilyConfig {
	name: string;
	provider: "bunny";
	weights: number[];
	global?: boolean;
}

export const fontFamilies: FontFamilyConfig[] = [
	{
		name: "Lexend",
		provider: "bunny",
		weights: [300, 400, 700, 800],
		global: true,
	},
];
