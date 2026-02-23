const { test, expect } = require("@playwright/test");

// ================================================
// HOZZÁFÉRÉS-VÉDELEM TESZTEK
// Ellenőrzi, hogy bejelentkezés nélkül
// nem érhetők el a védett oldalak
// ================================================

test.describe("Védett oldalak – bejelentkezés nélkül", () => {
	// Diák oldalak
	test("/ átirányít loginra", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/tasks átirányít loginra", async ({ page }) => {
		await page.goto("/tasks");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/grades átirányít loginra", async ({ page }) => {
		await page.goto("/grades");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/messages átirányít loginra", async ({ page }) => {
		await page.goto("/messages");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/messages/sent átirányít loginra", async ({ page }) => {
		await page.goto("/messages/sent");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/messages/new átirányít loginra", async ({ page }) => {
		await page.goto("/messages/new");
		await expect(page).toHaveURL(/\/login/);
	});

	// Tanári oldalak
	test("/teacher átirányít loginra", async ({ page }) => {
		await page.goto("/teacher");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/teacher/grading átirányít loginra", async ({ page }) => {
		await page.goto("/teacher/grading");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/teacher/messages átirányít loginra", async ({ page }) => {
		await page.goto("/teacher/messages");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/teacher/homework átirányít loginra", async ({ page }) => {
		await page.goto("/teacher/homework");
		await expect(page).toHaveURL(/\/login/);
	});

	// Admin oldalak
	test("/admin átirányít loginra", async ({ page }) => {
		await page.goto("/admin");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/admin/classes átirányít loginra", async ({ page }) => {
		await page.goto("/admin/classes");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/admin/subjects átirányít loginra", async ({ page }) => {
		await page.goto("/admin/subjects");
		await expect(page).toHaveURL(/\/login/);
	});

	test("/admin/assignments átirányít loginra", async ({ page }) => {
		await page.goto("/admin/assignments");
		await expect(page).toHaveURL(/\/login/);
	});
});
