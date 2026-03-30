const { test, expect } = require("@playwright/test");

// Tanár bejelentkezési adatok
const TEACHER = { username: "tanar", password: "tanar" };

// Bejelentkezés segédfüggvény
async function loginAsTeacher(page) {
	await page.goto("/login");
	await page.fill("#username", TEACHER.username);
	await page.fill("#password", TEACHER.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\/teacher/);
}

// ================================================
// TANÁR TESZTEK
// ================================================

test.describe("Tanár – Bejelentkezés", () => {
	test("tanár sikeresen bejelentkezik és a tanári főoldalra kerül", async ({ page }) => {
		await loginAsTeacher(page);
		await expect(page).toHaveURL(/\/teacher/);
	});

	test("tanári főoldalon az üdvözlő szöveg látható", async ({ page }) => {
		await loginAsTeacher(page);
		await expect(page.locator("h2")).toContainText("Üdvözöllek");
	});
});

test.describe("Tanár – Navigáció", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("tanári navigáció látható", async ({ page }) => {
		await expect(page.locator("nav ul a[href='/teacher/grading']")).toBeVisible();
		await expect(page.locator("nav ul a[href='/teacher/homework']")).toBeVisible();
		await expect(page.locator("nav ul a[href='/teacher/messages']")).toBeVisible();
	});

	test("értékelés oldal betölt", async ({ page }) => {
		await page.goto("/teacher/grading");
		await expect(page).toHaveURL("/teacher/grading");
	});

	test("házi feladatok oldal betölt", async ({ page }) => {
		await page.goto("/teacher/homework");
		await expect(page).toHaveURL("/teacher/homework");
	});

	test("üzenetek oldal betölt", async ({ page }) => {
		await page.goto("/teacher/messages");
		await expect(page).toHaveURL("/teacher/messages");
	});

	test("elküldött üzenetek oldal betölt", async ({ page }) => {
		await page.goto("/teacher/messages/sent");
		await expect(page).toHaveURL("/teacher/messages/sent");
	});

	test("új üzenet oldal betölt", async ({ page }) => {
		await page.goto("/teacher/messages/new");
		await expect(page).toHaveURL("/teacher/messages/new");
	});
});

test.describe("Tanár – Jogosultság", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("tanár nem érheti el az admin oldalt", async ({ page }) => {
		const response = await page.goto("/admin");
		const status = response?.status();
		expect(status === 403 || !page.url().includes("/admin")).toBeTruthy();
	});
});

test.describe("Tanár – Kijelentkezés", () => {
	test("kijelentkezés után visszakerül a login oldalra", async ({ page }) => {
		await loginAsTeacher(page);
		await page.goto("/logout");
		await expect(page).toHaveURL(/\/login/);
	});

	test("kijelentkezés után a tanári oldal nem érhető el", async ({ page }) => {
		await loginAsTeacher(page);
		await page.goto("/logout");
		await page.waitForURL(/\/login/);
		await page.goto("/teacher");
		await expect(page).toHaveURL(/\/login/);
	});
});
