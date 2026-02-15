// Jegyek oldal - tantárgyak szerint csoportosítva
async function studentGrades(req, res) {
	try {
		const db = req.db;
		const studentId = req.session.id;

		// 1. Lekérjük a diák osztályát
		const studentClass = await db.student_classes.findFirst({
			where: {
				student_id: studentId,
				is_active: true,
			},
			select: {
				class_id: true,
			},
		});

		if (!studentClass) {
			return res.render("student/grades", {
				username: req.session.username,
				gradesBySubject: {},
			});
		}

		// 2. Lekérjük az osztályhoz hozzárendelt tantárgyakat (ABC sorrendben)
		const assignedSubjects = await db.teacher_subjects.findMany({
			where: {
				class_id: studentClass.class_id,
			},
			include: {
				subjects: {
					select: {
						id: true,
						subject_name: true,
					},
				},
			},
			orderBy: {
				subjects: {
					subject_name: "asc",
				},
			},
		});

		// 3. Egyedi tantárgyak kiszűrése (egy tantárgy csak egyszer szerepeljen)
		const uniqueSubjects = [];
		const seenSubjectIds = new Set();

		assignedSubjects.forEach((ts) => {
			if (!seenSubjectIds.has(ts.subjects.id)) {
				seenSubjectIds.add(ts.subjects.id);
				uniqueSubjects.push({
					id: ts.subjects.id,
					name: ts.subjects.subject_name,
				});
			}
		});

		// ABC sorrendbe rendezés
		uniqueSubjects.sort((a, b) => a.name.localeCompare(b.name, "hu"));

		// 4. Jegyek lekérése a diáknak
		const grades = await db.grades.findMany({
			where: { student_id: studentId },
			include: {
				subjects: true,
				users_grades_teacher_idTousers: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
			},
			orderBy: [{ grade_date: "asc" }],
		});

		// 5. Jegyek csoportosítása tantárgyak szerint
		// Minden hozzárendelt tantárgy megjelenik, akkor is ha nincs jegy
		const gradesBySubject = {};

		// Először minden hozzárendelt tantárgyat hozzáadunk (üres tömbbel)
		uniqueSubjects.forEach((subject) => {
			gradesBySubject[subject.name] = [];
		});

		// Majd hozzáadjuk a meglévő jegyeket
		grades.forEach((grade) => {
			const subjectName = grade.subjects.subject_name;
			// Csak akkor adjuk hozzá, ha ez egy hozzárendelt tantárgy
			if (gradesBySubject.hasOwnProperty(subjectName)) {
				gradesBySubject[subjectName].push(grade);
			}
		});

		res.render("student/grades", {
			username: req.session.username,
			gradesBySubject: gradesBySubject,
		});
	} catch (error) {
		console.error("Hiba a jegyek lekérésekor:", error);
		res.render("student/grades", {
			username: req.session.username,
			gradesBySubject: {},
		});
	}
}

module.exports = { studentGrades };
