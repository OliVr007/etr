// @ts-check
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
	testDir: "./e2e",
	fullyParallel: false, // Szekvenciálisan fusson, mert közös DB-t használunk
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1, // Egy worker, hogy ne legyen DB konfliktus
	reporter: "html",

	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},

	// Csak Chromiumon tesztelünk (gyorsabb)
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	// Automatikusan elindítja a szervert a tesztek előtt
	webServer: {
		command: "node server.js",
		url: "http://localhost:3000",
		reuseExistingServer: true, // Ha már fut, ne indítsa újra
		timeout: 15000,
	},
});
