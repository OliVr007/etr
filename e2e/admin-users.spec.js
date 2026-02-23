const { test, expect } = require("@playwright/test");

const ADMIN = { username: "admin", password: "admin" };

async function loginAsAdmin(page) {
	await page.goto("/login");
	await page.fill("#username", ADMIN.username);
	await page.fill("#password", ADMIN.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\/admin/);
}

// Egyedi teszt felhasználónév generálása, hogy ne ütközzön
const TEST_USERNAME = `playwright_test_${Date.now()}`;

// ================================================
// ADMIN – FELHASZNÁLÓ KEZELÉS UI
// ================================================

test.describe("Admin – Felhasználó kezelés UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("a felhasználók táblázat betölt és van adat", async ({ page }) => {
		await page.goto("/admin");
		await expect(page.locator("table.data-table")).toBeVisible();
		const rows = await page.locator("table.data-table tbody tr").count();
		expect(rows).toBeGreaterThan(0);
	});

	test("Új felhasználó modal mezői láthatók", async ({ page }) => {
		await page.goto("/admin");
		await page.click("button[onclick='openAddUserModal()']");
		await expect(page.locator("#add_username")).toBeVisible();
		await expect(page.locator("#add_password")).toBeVisible();
		await expect(page.locator("#add_first_name")).toBeVisible();
		await expect(page.locator("#add_last_name")).toBeVisible();
		await expect(page.locator("#add_role")).toBeVisible();
	});

	test("diák szerepkör választásakor osztály választó megjelenik", async ({ page }) => {
		await page.goto("/admin");
		await page.click("button[onclick='openAddUserModal()']");
		await page.selectOption("#add_role", "student");
		await expect(page.locator("#add_class_group")).toBeVisible();
	});

	test("tanár szerepkör választásakor nincs osztály választó", async ({ page }) => {
		await page.goto("/admin");
		await page.click("button[onclick='openAddUserModal()']");
		await page.selectOption("#add_role", "teacher");
		await expect(page.locator("#add_class_group")).toBeHidden();
	});
});

// ================================================
// ADMIN – FELHASZNÁLÓ LÉTREHOZÁS API
// ================================================

test.describe("Admin – Felhasználó létrehozás és törlés API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("új tanár felhasználó létrehozható és törölhető", async ({ page }) => {
		await page.goto("/admin");

		const result = await page.evaluate(async (username) => {
			// 1. Létrehozás
			const createRes = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: username,
					password: "teszt1234",
					first_name: "Playwright",
					last_name: "Teszt",
					email: `${username}@teszt.hu`,
					role: "teacher",
				}),
			});
			const createData = await createRes.json();
			if (!createRes.ok) return { createStatus: createRes.status, error: createData.error };

			const newUserId = createData.user?.id;
			if (!newUserId) return { createStatus: createRes.status, error: "no_id" };

			// 2. Törlés
			const deleteRes = await fetch(`/api/admin/users/${newUserId}`, {
				method: "DELETE",
			});

			return {
				createStatus: createRes.status,
				deleteStatus: deleteRes.status,
				userId: newUserId,
			};
		}, TEST_USERNAME);

		expect(result.error).toBeUndefined();
		expect(result.createStatus).toBe(200);
		expect(result.deleteStatus).toBe(200);
	});

	test("hiányzó kötelező mezővel nem hozható létre felhasználó", async ({ page }) => {
		await page.goto("/admin");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: "hianyos_user",
					// password és role hiányzik
					first_name: "Teszt",
				}),
			});
			return res.status;
		});
		expect(status).toBe(400);
	});

	test("már létező felhasználónévvel nem hozható létre user", async ({ page }) => {
		await page.goto("/admin");
		const status = await page.evaluate(async (adminUsername) => {
			const res = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: adminUsername, // már létezik
					password: "teszt1234",
					first_name: "Dupla",
					last_name: "Teszt",
					email: "dupla@teszt.hu",
					role: "teacher",
				}),
			});
			return res.status;
		}, ADMIN.username);
		expect(status).toBe(400);
	});

	test("saját admin fiók nem törölhető", async ({ page }) => {
		await page.goto("/admin");
		const result = await page.evaluate(async () => {
			// Lekérjük saját ID-t a táblázatból
			const rows = document.querySelectorAll("table.data-table tbody tr");
			let adminId = null;
			for (const row of rows) {
				const cells = row.querySelectorAll("td");
				if (cells[1]?.textContent?.trim() === "admin") {
					adminId = cells[0]?.textContent?.trim();
					break;
				}
			}
			if (!adminId) return { skipped: true };

			const res = await fetch(`/api/admin/users/${adminId}`, { method: "DELETE" });
			return { status: res.status };
		});

		if (result.skipped) return;
		expect(result.status).toBe(400);
	});
});
