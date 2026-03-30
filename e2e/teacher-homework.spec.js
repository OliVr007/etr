const { test, expect } = require("@playwright/test");

const TEACHER = { username: "tanar", password: "tanar" };

async function loginAsTeacher(page) {
	await page.goto("/login");
	await page.fill("#username", TEACHER.username);
	await page.fill("#password", TEACHER.password);
	await page.click("button[type='submit']");
	await page.waitForURL(/\/teacher/);
}

// ================================================
// TANÁR – HÁZI FELADAT KEZELÉS UI
// ================================================

test.describe("Tanár – Házi feladat UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("házi feladatok oldal betölt", async ({ page }) => {
		await page.goto("/teacher/homework");
		await expect(page).toHaveURL("/teacher/homework");
	});

	test("tanár le tudja kérni a házi feladatait", async ({ page }) => {
		await page.goto("/teacher");
		const result = await page.evaluate(async () => {
			const res = await fetch("/api/teacher/homeworks");
			const data = await res.json();
			return { status: res.status, isArray: Array.isArray(data.homeworks) };
		});
		expect(result.status).toBe(200);
		expect(result.isArray).toBe(true);
	});
});

test.describe("Tanár – Házi feladat létrehozás API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("kötelező mezők nélkül nem hozható létre házi feladat", async ({ page }) => {
		await page.goto("/teacher");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/teacher/homework", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Hiányos feladat" }),
			});
			return res.status;
		});
		expect(status).toBe(400);
	});

	test("osztály és diák nélkül nem hozható létre házi feladat", async ({ page }) => {
		await page.goto("/teacher");
		const result = await page.evaluate(async () => {
			const classRes = await fetch("/api/teacher/classes");
			const classData = await classRes.json();
			const classes = classData.classes || [];
			if (classes.length === 0) return { skipped: true, reason: "no_classes" };

			const subjectRes = await fetch(`/api/teacher/class/${classes[0].id}/subjects`);
			const subjectData = await subjectRes.json();
			const subjects = subjectData.subjects || [];
			if (subjects.length === 0) return { skipped: true, reason: "no_subjects" };

			const res = await fetch("/api/teacher/homework", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					subject_id: subjects[0].id,
					title: "Teszt feladat",
					description: "Leírás",
					due_date: "2025-12-31",
				}),
			});
			return { status: res.status };
		});

		if (result.skipped) return;
		expect(result.status).toBe(400);
	});

	test("házi feladat létrehozható diákhoz ha van tantárgy", async ({ page }) => {
		await page.goto("/teacher");

		const result = await page.evaluate(async () => {
			const classRes = await fetch("/api/teacher/classes");
			const classData = await classRes.json();
			const classes = classData.classes || [];
			if (classes.length === 0) return { skipped: true, reason: "no_classes" };

			const subjectRes = await fetch(`/api/teacher/class/${classes[0].id}/subjects`);
			const subjectData = await subjectRes.json();
			const subjects = subjectData.subjects || [];
			if (subjects.length === 0) return { skipped: true, reason: "no_subjects" };

			const studentRes = await fetch(`/api/teacher/class/${classes[0].id}/students`);
			const studentData = await studentRes.json();
			const students = studentData.students || [];
			if (students.length === 0) return { skipped: true, reason: "no_students" };

			const res = await fetch("/api/teacher/homework", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					subject_id: subjects[0].id,
					student_id: students[0].id,
					title: "Playwright teszt házi feladat",
					description: "Ez egy automatikus teszt által létrehozott feladat.",
					due_date: "2025-12-31",
				}),
			});
			const data = await res.json();
			return { status: res.status, success: data.success, homeworkId: data.homework?.id };
		});

		if (result.skipped) {
			console.log("Teszt kihagyva:", result.reason);
			return;
		}

		expect(result.status).toBe(201);
		expect(result.success).toBe(true);
	});
});

test.describe("Tanár – Házi feladat elfogadás API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("nem létező submission elfogadása hibát ad", async ({ page }) => {
		await page.goto("/teacher");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/teacher/homework/accept/999999", { method: "PUT" });
			return res.status;
		});
		expect(status === 404 || status === 500).toBeTruthy();
	});

	test("tanár le tudja kérni és elfogadni a beadott feladatokat", async ({ page }) => {
		await page.goto("/teacher");

		const result = await page.evaluate(async () => {
			const res = await fetch("/api/teacher/homeworks");
			const data = await res.json();
			const homeworks = data.homeworks || [];

			// Keresünk submitted státuszú submission-t
			let submittedId = null;
			for (const hw of homeworks) {
				const submitted = hw.submissions?.find((s) => s.status === "submitted");
				if (submitted) {
					submittedId = submitted.id;
					break;
				}
			}

			if (!submittedId) return { skipped: true, reason: "no_submitted_homework" };

			const acceptRes = await fetch(`/api/teacher/homework/accept/${submittedId}`, { method: "PUT" });
			return { status: acceptRes.status };
		});

		if (result.skipped) {
			console.log("Teszt kihagyva:", result.reason);
			return;
		}
		expect(result.status).toBe(200);
	});
});
