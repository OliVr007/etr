const { test, expect } = require("@playwright/test");

const STUDENT = { username: "diak", password: "diak" };

async function loginAsStudent(page) {
	await page.goto("/login");
	await page.fill("#username", STUDENT.username);
	await page.fill("#password", STUDENT.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\//);
}

// ================================================
// DIÁK – HÁZI FELADAT
// ================================================

test.describe("Diák – Házi feladat UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("házi feladatok oldal betölt", async ({ page }) => {
		await page.goto("/tasks");
		await expect(page).toHaveURL("/tasks");
		await expect(page.locator("h1")).toContainText("Házi feladatok");
		await expect(page.locator("#task-list")).toBeVisible();
	});

	test("házi feladat lista betölt (API hívás)", async ({ page }) => {
		await page.goto("/tasks");
		await page.waitForTimeout(1000);
		// A task-list div megjelenik (üres vagy feltöltött)
		await expect(page.locator("#task-list")).toBeVisible();
	});
});

test.describe("Diák – Házi feladat API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("diák le tudja kérni a házi feladatait", async ({ page }) => {
		await page.goto("/");
		const result = await page.evaluate(async () => {
			const res = await fetch("/api/student/homeworks");
			const data = await res.json();
			return {
				status: res.status,
				isArray: Array.isArray(data.homeworks) || Array.isArray(data),
			};
		});
		expect(result.status).toBe(200);
	});

	test("házi feladat beadható ha van pending feladat", async ({ page }) => {
		await page.goto("/");

		const result = await page.evaluate(async () => {
			const res = await fetch("/api/student/homeworks");
			const data = await res.json();
			const homeworks = data.homeworks || data || [];

			// Keresünk pending státuszú feladatot
			const pending = homeworks.find((hw) => hw.status === "pending" || hw.submission_status === "pending");

			if (!pending) return { skipped: true, reason: "no_pending_homework" };

			const submissionId = pending.submission_id || pending.id;
			const submitRes = await fetch(`/api/student/homework/submit/${submissionId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
			});

			return { status: submitRes.status };
		});

		if (result.skipped) {
			console.log("Teszt kihagyva:", result.reason);
			return;
		}

		expect(result.status).toBe(200);
	});

	test("nem létező feladat beadása 404-et ad", async ({ page }) => {
		await page.goto("/");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/student/homework/submit/999999", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
			});
			return res.status;
		});
		expect(status).toBe(404);
	});

	test("bejelentkezett diák API hívása 401 nélkül megy át", async ({ page }) => {
		await page.goto("/");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/student/homeworks");
			return res.status;
		});
		// Bejelentkezett user -> 200, nem 401
		expect(status).toBe(200);
	});

	test("bejelentkezés nélküli API hívás 401-et ad", async ({ browser }) => {
		const context = await browser.newContext();
		const freshPage = await context.newPage();
		await freshPage.goto("http://localhost:3000/login");

		const status = await freshPage.evaluate(async () => {
			const res = await fetch("/api/student/homeworks", {
				redirect: "manual",
			});
			return res.status === 0 ? 302 : res.status;
		});

		await context.close();
		expect(status).toBe(401);
	});
});
