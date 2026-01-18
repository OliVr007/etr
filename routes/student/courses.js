// Diák órarend oldal
async function studentCourses(req, res) {
	try {
		const db = req.db;
		// Diák osztályának megkeresése
		const studentClass = await db.student_classes.findFirst({
			where: {
				student_id: req.session.id,
				is_active: true,
			},
			include: {
				classes: true,
			},
		});

		// Ha nincs osztálya a diáknak
		if (!studentClass) {
			return res.render("student/courses", {
				username: req.session.username,
				timetable: [],
				className: null,
			});
		}

		// Órarend lekérése
		const timetable = await db.timetable.findMany({
			where: {
				class_id: studentClass.class_id,
			},
			include: {
				subjects: true,
				users: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
			},
			orderBy: [{ day_of_week: "asc" }, { lesson_number: "asc" }],
		});

		res.render("student/courses", {
			username: req.session.username,
			timetable: timetable,
			className: studentClass.classes.class_name,
		});
	} catch (error) {
		console.error("Hiba az órarend lekérésekor:", error);
		res.render("student/courses", {
			username: req.session.username,
			timetable: [],
			className: null,
		});
	}
}

module.exports = { studentCourses };
