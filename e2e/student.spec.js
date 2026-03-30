const { test, expect } = require("@playwright/test");

// Diák bejelentkezési adatok
const STUDENT = { username: "diak", password: "diak" };

// Bejelentkezés segédfüggvény
async function loginAsStudent(page) {
	await page.goto("/login");
	await page.fill("#username", STUDENT.username);
	await page.fill("#password", STUDENT.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\//);
}

// ================================================
// DIÁK TESZTEK
// ================================================

test.describe("Diák – Bejelentkezés", () => {
	test("diák sikeresen bejelentkezik és a főoldalra kerül", async ({ page }) => {
		await loginAsStudent(page);
		await expect(page).not.toHaveURL(/\/login/);
		await expect(page).not.toHaveURL(/\/admin/);
		await expect(page).not.toHaveURL(/\/teacher/);
	});
});

test.describe("Diák – Navigáció", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("főoldal betölt", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("nav").first()).toBeVisible();
		await expect(page.locator("a[href='/grades']").first()).toBeVisible();
		await expect(page.locator("a[href='/tasks']").first()).toBeVisible();
		await expect(page.locator("a[href='/messages']").first()).toBeVisible();
	});

	test("értékelések oldal betölt", async ({ page }) => {
		await page.goto("/grades");
		await expect(page).toHaveURL("/grades");
		await expect(page.locator("h2")).toContainText("Értékelések");
	});

	test("házi feladatok oldal betölt", async ({ page }) => {
		await page.goto("/tasks");
		await expect(page).toHaveURL("/tasks");
		await expect(page.locator("h1")).toContainText("Házi feladatok");
	});

	test("bejövő üzenetek oldal betölt", async ({ page }) => {
		await page.goto("/messages");
		await expect(page).toHaveURL("/messages");
	});

	test("elküldött üzenetek oldal betölt", async ({ page }) => {
		await page.goto("/messages/sent");
		await expect(page).toHaveURL("/messages/sent");
	});

	test("új üzenet oldal betölt", async ({ page }) => {
		await page.goto("/messages/new");
		await expect(page).toHaveURL("/messages/new");
	});
});

test.describe("Diák – Jogosultság", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("diák nem érheti el az admin oldalt (403)", async ({ page }) => {
		const response = await page.goto("/admin");
		const url = page.url();
		const status = response?.status();
		expect(status === 403 || url.includes("/login") || url.includes("/admin") === false).toBeTruthy();
	});

	test("diák nem érheti el a tanári oldalt (403)", async ({ page }) => {
		const response = await page.goto("/teacher");
		const status = response?.status();
		const url = page.url();
		expect(status === 403 || !url.includes("/teacher")).toBeTruthy();
	});
});

test.describe("Diák – Kijelentkezés", () => {
	test("kijelentkezés után visszakerül a login oldalra", async ({ page }) => {
		await loginAsStudent(page);
		await page.goto("/logout");
		await expect(page).toHaveURL(/\/login/);
	});

	test("kijelentkezés után nem érhető el a főoldal", async ({ page }) => {
		await loginAsStudent(page);
		await page.goto("/logout");
		await page.waitForURL(/\/login/);
		await page.goto("/");
		await expect(page).toHaveURL(/\/login/);
	});
});
