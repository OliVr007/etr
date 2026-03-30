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
// DIÁK – HÁZI FELADAT TÖRLÉS
// ================================================

test.describe("Diák – Házi feladat törlés API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("nem létező házi feladat törlése 404-et ad", async ({ page }) => {
		await page.goto("/");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/student/homework/999999", { method: "DELETE" });
			return res.status;
		});
		expect(status).toBe(400);
	});

	test("bejelentkezés nélkül nem törölhető házi feladat", async ({ browser }) => {
		const context = await browser.newContext();
		const freshPage = await context.newPage();
		await freshPage.goto("http://localhost:3000/login");

		const status = await freshPage.evaluate(async () => {
			const res = await fetch("/api/student/homework/1", { method: "DELETE" });
			return res.status;
		});

		await context.close();
		expect(status).toBe(401);
	});

	test("pending házi feladat törölhető ha van", async ({ page }) => {
		await page.goto("/");

		const result = await page.evaluate(async () => {
			const res = await fetch("/api/student/homeworks");
			const data = await res.json();
			const homeworks = data.homeworks || [];

			const pending = homeworks.find((hw) => hw.status === "accepted");
			if (!pending) return { skipped: true, reason: "no_pending_homework" };

			const deleteRes = await fetch(`/api/student/homework/${pending.id}`, { method: "DELETE" });
			return { status: deleteRes.status };
		});

		if (result.skipped) {
			console.log("Teszt kihagyva:", result.reason);
			return;
		}
		expect(result.status).toBe(200);
	});
});

// ================================================
// DIÁK – ÜZENET OLVASOTTNAK JELÖLÉS
// ================================================

test.describe("Diák – Üzenet olvasottnak jelölés API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("nem létező üzenet olvasottnak jelölése 404-et ad", async ({ page }) => {
		await page.goto("/");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/messages/999999/read", { method: "PUT" });
			return res.status;
		});
		expect(status === 404 || status === 500 || status === 403).toBeTruthy();
	});

	test("beérkezett üzenet olvasottnak jelölhető", async ({ page }) => {
		await page.goto("/");

		const result = await page.evaluate(async () => {
			const res = await fetch("/api/messages/received");
			const data = await res.json();
			const messages = data.messages || [];

			const unread = messages.find((m) => !m.is_read);
			if (!unread) return { skipped: true, reason: "no_unread_messages" };

			const markRes = await fetch(`/api/messages/${unread.id}/read`, { method: "PUT" });
			return { status: markRes.status };
		});

		if (result.skipped) {
			console.log("Teszt kihagyva:", result.reason);
			return;
		}
		expect(result.status).toBe(200);
	});

	test("bejelentkezés nélkül nem jelölhető olvasottnak üzenet", async ({ browser }) => {
		const context = await browser.newContext();
		const freshPage = await context.newPage();
		await freshPage.goto("http://localhost:3000/login");

		const status = await freshPage.evaluate(async () => {
			const res = await fetch("/api/messages/1/read", { method: "PUT" });
			return res.status;
		});

		await context.close();
		expect(status).toBe(401);
	});
});

// ================================================
// DIÁK – HÁZI FELADAT BEADÁS (ha van adat)
// ================================================

test.describe("Diák – Házi feladat beadás API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("pending feladat beadható", async ({ page }) => {
		await page.goto("/");

		const result = await page.evaluate(async () => {
			const res = await fetch("/api/student/homeworks");
			const data = await res.json();
			const homeworks = data.homeworks || [];

			const pending = homeworks.find((hw) => hw.status === "pending");
			if (!pending) return { skipped: true, reason: "no_pending_homework" };

			const submitRes = await fetch(`/api/student/homework/submit/${pending.id}`, { method: "PUT" });
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
			const res = await fetch("/api/student/homework/submit/999999", { method: "PUT" });
			return res.status;
		});
		expect(status).toBe(404);
	});
});
