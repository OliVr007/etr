// Jegyek oldal - tantárgyak szerint csoportosítva
async function studentGrades(req, res) {
	try {
		const db = req.db;
		// Összes jegy lekérése a diáknak
		const grades = await db.grades.findMany({
			where: { student_id: req.session.id },
			include: {
				subjects: true,
				users_grades_teacher_idTousers: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
			},
			orderBy: [{ subjects: { subject_name: "asc" } }, { grade_date: "asc" }],
		});

		// Jegyek csoportosítása tantárgyak szerint
		const gradesBySubject = {};
		grades.forEach((grade) => {
			const subjectName = grade.subjects.subject_name;
			if (!gradesBySubject[subjectName]) {
				gradesBySubject[subjectName] = [];
			}
			gradesBySubject[subjectName].push(grade);
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
