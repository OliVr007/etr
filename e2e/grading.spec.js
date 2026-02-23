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
// TANÁR – JEGYBEÍRÁS
// ================================================

test.describe("Tanár – Jegybeírás UI", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("értékelés oldal betölt", async ({ page }) => {
		await page.goto("/teacher/grading");
		await expect(page).toHaveURL("/teacher/grading");
	});

	test("osztály és tantárgy választó megjelenik", async ({ page }) => {
		await page.goto("/teacher/grading");
		await page.waitForTimeout(1000);
		// A grading oldalon van osztály/tantárgy választó
		const selects = await page.locator("select").count();
		expect(selects).toBeGreaterThanOrEqual(1);
	});
});

test.describe("Tanár – Jegybeírás API", () => {
	test.beforeEach(async ({ page }) => {
		await loginAsTeacher(page);
	});

	test("tanár le tudja kérni az osztályait", async ({ page }) => {
		await page.goto("/teacher");
		const result = await page.evaluate(async () => {
			const res = await fetch("/api/teacher/classes");
			const data = await res.json();
			return { status: res.status, hasClasses: Array.isArray(data.classes) };
		});
		expect(result.status).toBe(200);
		expect(result.hasClasses).toBe(true);
	});

	test("jegy mentése valid adatokkal sikerül", async ({ page }) => {
		await page.goto("/teacher");

		const result = await page.evaluate(async () => {
			// Először lekérjük az osztályokat
			const classRes = await fetch("/api/teacher/classes");
			const classData = await classRes.json();
			const classes = classData.classes || [];
			if (classes.length === 0) return { skipped: true, reason: "no_classes" };

			const classId = classes[0].id;

			// Lekérjük a tantárgyakat
			const subjectRes = await fetch(`/api/teacher/class/${classId}/subjects`);
			const subjectData = await subjectRes.json();
			const subjects = subjectData.subjects || [];
			if (subjects.length === 0) return { skipped: true, reason: "no_subjects" };

			const subjectId = subjects[0].id;

			// Lekérjük a diákokat
			const studentRes = await fetch(`/api/teacher/class/${classId}/students`);
			const studentData = await studentRes.json();
			const students = studentData.students || [];
			if (students.length === 0) return { skipped: true, reason: "no_students" };

			const studentId = students[0].id;

			// Jegy mentése
			const saveRes = await fetch("/api/teacher/grading/save", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					grades: [
						{
							student_id: studentId,
							subject_id: subjectId,
							grade_value: 4,
							grade_type: "felelet",
							description: "Playwright teszt jegy",
							grade_date: new Date().toISOString().split("T")[0],
							weight: 1,
						},
					],
				}),
			});

			const saveData = await saveRes.json();
			return { status: saveRes.status, success: saveData.success, count: saveData.count };
		});

		if (result.skipped) {
			console.log("Teszt kihagyva:", result.reason);
			return;
		}

		expect(result.status).toBe(200);
		expect(result.success).toBe(true);
		expect(result.count).toBeGreaterThan(0);
	});

	test("üres jegy lista esetén az API 400-at ad", async ({ page }) => {
		await page.goto("/teacher");
		const status = await page.evaluate(async () => {
			const res = await fetch("/api/teacher/grading/save", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ grades: [] }),
			});
			return res.status;
		});
		expect(status).toBe(400);
	});

	test("érvénytelen jegyértékkel (pl. 9) nem ment", async ({ page }) => {
		await page.goto("/teacher");

		const result = await page.evaluate(async () => {
			const classRes = await fetch("/api/teacher/classes");
			const classData = await classRes.json();
			const classes = classData.classes || [];
			if (classes.length === 0) return { skipped: true };

			const classId = classes[0].id;
			const subjectRes = await fetch(`/api/teacher/class/${classId}/subjects`);
			const subjectData = await subjectRes.json();
			const subjects = subjectData.subjects || [];
			if (subjects.length === 0) return { skipped: true };

			const studentRes = await fetch(`/api/teacher/class/${classId}/students`);
			const studentData = await studentRes.json();
			const students = studentData.students || [];
			if (students.length === 0) return { skipped: true };

			const res = await fetch("/api/teacher/grading/save", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					grades: [
						{
							student_id: students[0].id,
							subject_id: subjects[0].id,
							grade_value: 9, // Érvénytelen!
							grade_type: "felelet",
							grade_date: new Date().toISOString().split("T")[0],
							weight: 1,
						},
					],
				}),
			});
			const data = await res.json();
			// A 9-es értéket az API kiszűri, count = 0 lesz
			return { status: res.status, count: data.count };
		});

		if (result.skipped) return;
		// Az API 200-at ad de 0 jegyet ment (kiszűri az érvénytelen értéket)
		expect(result.count).toBe(0);
	});
});
