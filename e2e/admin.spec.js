const { test, expect } = require("@playwright/test");

// Admin bejelentkezési adatok
const ADMIN = { username: "admin", password: "admin" };

// Bejelentkezés segédfüggvény
async function loginAsAdmin(page) {
	await page.goto("/login");
	await page.fill("#username", ADMIN.username);
	await page.fill("#password", ADMIN.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\/admin/);
}

// ADMIN TESZTEK

test.describe("Admin – Bejelentkezés", () => {
	test("admin sikeresen bejelentkezik és az admin oldalra kerül", async ({ page }) => {
		await loginAsAdmin(page);
		await expect(page).toHaveURL(/\/admin/);
	});
});

test.describe("Admin – Navigáció", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("felhasználók oldal betölt és a táblázat látható", async ({ page }) => {
		await page.goto("/admin");
		await expect(page.locator("table.data-table")).toBeVisible();
		await expect(page.locator("h2", { hasText: "Felhasználó kezelés" })).toBeVisible();
	});

	test("statisztikák láthatók az admin oldalon", async ({ page }) => {
		await page.goto("/admin");
		await expect(page.locator(".stats-grid")).toBeVisible();
		await expect(page.locator(".stat-card").first()).toBeVisible();
	});

	test("osztályok oldal betölt", async ({ page }) => {
		await page.goto("/admin/classes");
		await expect(page).toHaveURL("/admin/classes");
		await expect(page.locator("table.data-table")).toBeVisible();
	});

	test("tantárgyak oldal betölt", async ({ page }) => {
		await page.goto("/admin/subjects");
		await expect(page).toHaveURL("/admin/subjects");
		await expect(page.locator("table.data-table")).toBeVisible();
	});

	test("hozzárendelések oldal betölt", async ({ page }) => {
		await page.goto("/admin/assignments");
		await expect(page).toHaveURL("/admin/assignments");
		await expect(page.locator("table.data-table")).toBeVisible();
	});

	test("tab navigáció működik – Osztályok tab", async ({ page }) => {
		await page.goto("/admin");
		await page.click("a[href='/admin/classes']");
		await expect(page).toHaveURL("/admin/classes");
	});
});

test.describe("Admin – Felhasználó kezelés", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("Új felhasználó gomb látható", async ({ page }) => {
		await page.goto("/admin");
		await expect(page.locator("button[onclick='openAddUserModal()']")).toBeVisible();
	});

	test("Új felhasználó modal megnyílik", async ({ page }) => {
		await page.goto("/admin");
		await page.click("button[onclick='openAddUserModal()']");
		await expect(page.locator("#addUserModal")).toBeVisible();
	});

	test("Felhasználó modal bezárható", async ({ page }) => {
		await page.goto("/admin");
		await page.click("button[onclick='openAddUserModal()']");
		await expect(page.locator("#addUserModal")).toBeVisible();
		await page.locator("#addUserModal .close-btn").click();
		await expect(page.locator("#addUserModal")).toBeHidden();
	});

	test("API – felhasználó lekérése", async ({ page }) => {
		await page.goto("/admin");
		const status = await page.evaluate(async () => {
			const rows = document.querySelectorAll("table.data-table tbody tr");
			const firstId = rows[0]?.querySelector("td")?.textContent?.trim();
			if (!firstId) return 404;
			const res = await fetch(`/api/admin/users/${firstId}`);
			return res.status;
		});
		expect(status).toBe(200);
	});
});

test.describe("Admin – Kijelentkezés", () => {
	test("kijelentkezés után visszakerül a login oldalra", async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto("/logout");
		await expect(page).toHaveURL(/\/login/);
	});

	test("kijelentkezés után az admin oldal nem érhető el", async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto("/logout");
		await page.waitForURL(/\/login/);
		await page.goto("/admin");
		await expect(page).toHaveURL(/\/login/);
	});
});
