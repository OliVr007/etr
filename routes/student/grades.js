// Jegyek oldal
async function studentGrades(req, res) {
	try {
		const db = req.db;
		const studentId = req.session.id;

		// Lekérjük a diák osztályát
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

		// Lekérjük az osztályhoz hozzárendelt tantárgyakat (ABC sorrendben)
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

		// Egyedi tantárgyak kiszűrése (egy tantárgy csak egyszer szerepeljen)
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

		// Jegyek lekérése a diáknak
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
		const gradesBySubject = {};

		uniqueSubjects.forEach((subject) => {
			gradesBySubject[subject.name] = [];
		});

		grades.forEach((grade) => {
			const subjectName = grade.subjects.subject_name;
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
