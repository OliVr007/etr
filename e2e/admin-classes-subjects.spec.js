const { test, expect } = require("@playwright/test");

const ADMIN = { username: "admin", password: "admin" };

async function loginAsAdmin(page) {
	await page.goto("/login");
	await page.fill("#username", ADMIN.username);
	await page.fill("#password", ADMIN.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\/admin/);
}

const TEST_CLASS = { class_name: `PW${Date.now().toString().slice(-5)}`, academic_year: "2024/2025" };
const TEST_SUBJECT = { subject_code: `PW${Date.now().toString().slice(-4)}`, subject_name: `Playwright Tantárgy ${Date.now()}` };

// ADMIN – OSZTÁLY KEZELÉS

test.describe("Admin – Osztály kezelés UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("osztályok oldal betölt és táblázat látható", async ({ page }) => {
		await page.goto("/admin/classes");
		await expect(page.locator("table.data-table")).toBeVisible();
		await expect(page.locator("h2", { hasText: "Osztály kezelés" })).toBeVisible();
	});

	test("Új osztály modal megnyílik", async ({ page }) => {
		await page.goto("/admin/classes");
		await page.click("button[onclick='openAddClassModal()']");
		await expect(page.locator("#addClassModal")).toBeVisible();
	});

	test("Új osztály modal bezárható", async ({ page }) => {
		await page.goto("/admin/classes");
		await page.click("button[onclick='openAddClassModal()']");
		await page.locator("#addClassModal .close-btn").click();
		await expect(page.locator("#addClassModal")).toBeHidden();
	});
});

test.describe("Admin – Osztály CRUD API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("osztály létrehozható és törölhető", async ({ page }) => {
		await page.goto("/admin/classes");

		const result = await page.evaluate(async (cls) => {
			// Létrehozás
			const createRes = await fetch("/api/admin/classes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cls),
			});
			const createData = await createRes.json();
			if (!createRes.ok) return { createStatus: createRes.status, error: createData.error };

			const classId = createData.class?.id;
			if (!classId) return { error: "no_id" };

			// Törlés
			const deleteRes = await fetch(`/api/admin/classes/${classId}`, { method: "DELETE" });
			return { createStatus: createRes.status, deleteStatus: deleteRes.status };
		}, TEST_CLASS);

		expect(result.error).toBeUndefined();
		expect(result.createStatus).toBe(200);
		expect(result.deleteStatus).toBe(200);
	});

	test("kötelező mezők nélkül nem hozható létre osztály", async ({ page }) => {
		await page.goto("/admin/classes");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/admin/classes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ class_name: "Hiányos" }), // academic_year hiányzik
			});
			return res.status;
		});
		expect(status).toBe(400);
	});

	test("duplikált osztály nem hozható létre", async ({ page }) => {
		await page.goto("/admin/classes");

		// Először létrehozunk egyet
		const result = await page.evaluate(
			async (cls) => {
				const createRes = await fetch("/api/admin/classes", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(cls),
				});
				const createData = await createRes.json();
				const classId = createData.class?.id;

				// Duplikált próba
				const dupRes = await fetch("/api/admin/classes", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(cls),
				});

				// Takarítás
				if (classId) await fetch(`/api/admin/classes/${classId}`, { method: "DELETE" });

				return { dupStatus: dupRes.status };
			},
			{ class_name: `D${Date.now().toString().slice(-5)}`, academic_year: "2024/2025" },
		);

		expect(result.dupStatus).toBe(400);
	});

	test("osztály szerkeszthető", async ({ page }) => {
		await page.goto("/admin/classes");

		const result = await page.evaluate(async (cls) => {
			// Létrehozás
			const createRes = await fetch("/api/admin/classes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(cls),
			});
			const createData = await createRes.json();
			const classId = createData.class?.id;
			if (!classId) return { error: "no_id" };

			// Szerkesztés
			const updateRes = await fetch(`/api/admin/classes/${classId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ class_name: cls.class_name + "_mod", academic_year: cls.academic_year }),
			});

			// Takarítás
			await fetch(`/api/admin/classes/${classId}`, { method: "DELETE" });

			return { updateStatus: updateRes.status };
		}, TEST_CLASS);

		expect(result.error).toBeUndefined();
		expect(result.updateStatus).toBe(200);
	});
});

// ADMIN – TANTÁRGY KEZELÉS

test.describe("Admin – Tantárgy kezelés UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("tantárgyak oldal betölt és táblázat látható", async ({ page }) => {
		await page.goto("/admin/subjects");
		await expect(page.locator("table.data-table")).toBeVisible();
		await expect(page.locator("h2", { hasText: "Tantárgy kezelés" })).toBeVisible();
	});

	test("Új tantárgy modal megnyílik", async ({ page }) => {
		await page.goto("/admin/subjects");
		await page.click("button[onclick='openAddSubjectModal()']");
		await expect(page.locator("#addSubjectModal")).toBeVisible();
	});
});

test.describe("Admin – Tantárgy CRUD API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("tantárgy létrehozható és törölhető", async ({ page }) => {
		await page.goto("/admin/subjects");

		const result = await page.evaluate(async (sub) => {
			const createRes = await fetch("/api/admin/subjects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(sub),
			});
			const createData = await createRes.json();
			if (!createRes.ok) return { createStatus: createRes.status, error: createData.error };

			const subjectId = createData.subject?.id;
			if (!subjectId) return { error: "no_id" };

			const deleteRes = await fetch(`/api/admin/subjects/${subjectId}`, { method: "DELETE" });
			return { createStatus: createRes.status, deleteStatus: deleteRes.status };
		}, TEST_SUBJECT);

		expect(result.error).toBeUndefined();
		expect(result.createStatus).toBe(200);
		expect(result.deleteStatus).toBe(200);
	});

	test("kötelező mezők nélkül nem hozható létre tantárgy", async ({ page }) => {
		await page.goto("/admin/subjects");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/admin/subjects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ subject_name: "Hiányos" }), // subject_code hiányzik
			});
			return res.status;
		});
		expect(status).toBe(400);
	});

	test("tantárgy szerkeszthető", async ({ page }) => {
		await page.goto("/admin/subjects");

		const result = await page.evaluate(async (sub) => {
			const createRes = await fetch("/api/admin/subjects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(sub),
			});
			const createData = await createRes.json();
			const subjectId = createData.subject?.id;
			if (!subjectId) return { error: "no_id" };

			const updateRes = await fetch(`/api/admin/subjects/${subjectId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...sub, subject_name: sub.subject_name + " (módosított)" }),
			});

			await fetch(`/api/admin/subjects/${subjectId}`, { method: "DELETE" });
			return { updateStatus: updateRes.status };
		}, TEST_SUBJECT);

		expect(result.error).toBeUndefined();
		expect(result.updateStatus).toBe(200);
	});
});

// ADMIN – HOZZÁRENDELÉS KEZELÉS

test.describe("Admin – Hozzárendelések UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsAdmin(page);
	});

	test("hozzárendelések oldal betölt", async ({ page }) => {
		await page.goto("/admin/assignments");
		await expect(page.locator("table.data-table")).toBeVisible();
		await expect(page.locator("h2", { hasText: "Tanár-Tantárgy hozzárendelés" })).toBeVisible();
	});
});
