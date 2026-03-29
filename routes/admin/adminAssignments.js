async function adminAssignments(req, res) {
	try {
		const db = req.db;

		const teacherSubjects = await db.teacher_subjects.findMany({
			orderBy: { academic_year: "desc" },
			include: {
				users: { select: { id: true, first_name: true, last_name: true } },
				subjects: { select: { id: true, subject_name: true, subject_code: true } },
				classes: { select: { id: true, class_name: true } },
			},
		});

		const teachers = await db.users.findMany({
			where: { role: "teacher" },
			orderBy: { last_name: "asc" },
			select: { id: true, first_name: true, last_name: true },
		});

		const subjects = await db.subjects.findMany({
			where: { is_active: true },
			orderBy: { subject_name: "asc" },
			select: { id: true, subject_code: true, subject_name: true },
		});

		const classes = await db.classes.findMany({
			orderBy: { class_name: "asc" },
			select: { id: true, class_name: true },
		});

		const stats = {
			totalUsers: await db.users.count(),
			totalClasses: await db.classes.count(),
			totalSubjects: await db.subjects.count(),
			totalAssignments: await db.teacher_subjects.count(),
		};

		res.render("admin/admin-assignments", { teacherSubjects, teachers, subjects, classes, stats });
	} catch (error) {
		console.error("Hiba:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { adminAssignments };
