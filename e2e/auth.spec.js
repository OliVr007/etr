const { test, expect } = require("@playwright/test");

// ================================================
// BEJELENTKEZÉS TESZTEK
// ================================================

test.describe("Bejelentkezési oldal", () => {
	test("login oldal betölt és az ETR felirat látható", async ({ page }) => {
		await page.goto("/login");
		await expect(page.locator("h1")).toHaveText("ETR");
		await expect(page.locator("p")).toContainText("Elektronikus Tanulmányi Rendszer");
	});

	test("felhasználónév és jelszó mező látható", async ({ page }) => {
		await page.goto("/login");
		await expect(page.locator("#username")).toBeVisible();
		await expect(page.locator("#password")).toBeVisible();
		await expect(page.locator("button[type='submit']")).toBeVisible();
	});

	test("hibás bejelentkezés hibaüzenetet jelenít meg", async ({ page }) => {
		await page.goto("/login");
		await page.fill("#username", "nemletezik");
		await page.fill("#password", "rosszjelszo");
		await page.click("button[type='submit']");
		// A szerver ?error= query paraméterrel irányít vissza
		await expect(page).toHaveURL(/\/login/);
		await expect(page.locator(".error-message")).toBeVisible();
	});

	test("üres mezőkkel nem lehet bejelentkezni", async ({ page }) => {
		await page.goto("/login");
		await page.click("button[type='submit']");
		// A required attribútum miatt az oldal nem küldi el a formot
		await expect(page).toHaveURL("/login");
	});
});

// ================================================
// KIJELENTKEZÉS TESZT
// ================================================

test.describe("Kijelentkezés", () => {
	test("/logout átirányít a login oldalra", async ({ page }) => {
		await page.goto("/logout");
		await expect(page).toHaveURL(/\/login/);
	});
});
