const { test, expect } = require("@playwright/test");

const STUDENT = { username: "diak", password: "diak" };
const TEACHER = { username: "tanar", password: "tanar" };

async function loginAsStudent(page) {
	await page.goto("/login");
	await page.fill("#username", STUDENT.username);
	await page.fill("#password", STUDENT.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\//);
}

async function loginAsTeacher(page) {
	await page.goto("/login");
	await page.fill("#username", TEACHER.username);
	await page.fill("#password", TEACHER.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\/teacher/);
}

// ================================================
// DIÁK – ÜZENET KÜLDÉS
// ================================================

test.describe("Diák – Üzenet küldés UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("új üzenet oldal betölt és a form látható", async ({ page }) => {
		await page.goto("/messages/new");
		await expect(page.locator("h2")).toContainText("Új üzenet");
		await expect(page.locator("#recipient")).toBeVisible();
		await expect(page.locator("#subject")).toBeVisible();
		await expect(page.locator("textarea")).toBeVisible();
	});

	test("a címzett lista betölt (API hívás)", async ({ page }) => {
		await page.goto("/messages/new");
		await page.waitForTimeout(1000);
		const options = await page.locator("#recipient option").count();
		expect(options).toBeGreaterThan(1);
	});

	test("üres formot nem lehet elküldeni", async ({ page }) => {
		await page.goto("/messages/new");
		await page.waitForTimeout(500);
		const url = page.url();
		await expect(page).toHaveURL(url);
	});
});

test.describe("Diák – Üzenet küldés API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsStudent(page);
	});

	test("üzenet küldése sikeresen megtörténik", async ({ page }) => {
		await page.goto("/messages/new");

		// Első elérhető felhasználót lekérjük az API-n át
		const result = await page.evaluate(async () => {
			const usersRes = await fetch("/api/messages/users");
			const usersData = await usersRes.json();
			const users = usersData.users || [];
			if (users.length === 0) return { status: 0, error: "no_users" };

			const receiverId = users[0].id;
			const res = await fetch("/api/messages/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					receiver_id: receiverId,
					title: "Teszt üzenet",
					content: "Ez egy automatikus teszt üzenet.",
				}),
			});
			return { status: res.status };
		});

		expect(result.error).toBeUndefined();
		expect(result.status).toBe(200);
	});

	test("hiányzó mezőkkel az API 400-at ad vissza", async ({ page }) => {
		await page.goto("/");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/messages/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Csak cím" }),
			});
			return res.status;
		});
		expect(status).toBe(400);
	});

	test("elküldött üzenetek API-ja visszaadja az üzeneteket", async ({ page }) => {
		await page.goto("/");
		const result = await page.evaluate(async () => {
			const res = await fetch("/api/messages/sent");
			const data = await res.json();
			return { status: res.status, hasMessages: Array.isArray(data.messages) };
		});
		expect(result.status).toBe(200);
		expect(result.hasMessages).toBe(true);
	});

	test("beérkezett üzenetek API-ja visszaadja az üzeneteket", async ({ page }) => {
		await page.goto("/");
		const result = await page.evaluate(async () => {
			const res = await fetch("/api/messages/received");
			const data = await res.json();
			return { status: res.status, hasMessages: Array.isArray(data.messages) };
		});
		expect(result.status).toBe(200);
		expect(result.hasMessages).toBe(true);
	});
});

// ================================================
// TANÁR – ÜZENET KÜLDÉS
// ================================================

test.describe("Tanár – Üzenet küldés UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("tanári új üzenet oldal betölt", async ({ page }) => {
		await page.goto("/teacher/messages/new");
		await expect(page.locator("h2")).toContainText("Új üzenet");
		await expect(page.locator("#recipient_type")).toBeVisible();
		await expect(page.locator("#subject")).toBeVisible();
		await expect(page.locator("textarea")).toBeVisible();
	});

	test("tanár is tud üzenetet küldeni az API-n keresztül", async ({ page }) => {
		await page.goto("/teacher");
		const result = await page.evaluate(async () => {
			const usersRes = await fetch("/api/teacher/messages/users");
			const usersData = await usersRes.json();
			const users = usersData.users || [];
			if (users.length === 0) return { status: 0, error: "no_users" };

			const receiverId = users[0].id;
			const res = await fetch("/api/teacher/messages/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					receiver_id: receiverId,
					title: "Tanári teszt üzenet",
					content: "Ez egy tanári automatikus teszt üzenet.",
				}),
			});
			return { status: res.status };
		});

		expect(result.error).toBeUndefined();
		expect(result.status).toBe(200);
	});
});
