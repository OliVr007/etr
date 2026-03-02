async function adminClasses(req, res) {
	try {
		const db = req.db;

		const classes = await db.classes.findMany({
			orderBy: { class_name: "asc" },
			select: {
				id: true,
				class_name: true,
				academic_year: true,
				room_number: true,
				class_teacher_id: true,
				users: { select: { first_name: true, last_name: true } },
			},
		});

		const teachers = await db.users.findMany({
			where: { role: "teacher" },
			orderBy: { last_name: "asc" },
			select: { id: true, first_name: true, last_name: true },
		});

		// Foglalt osztályfőnök ID-k összegyűjtése
		const assignedTeacherIds = classes.filter((c) => c.class_teacher_id !== null).map((c) => c.class_teacher_id);

		// Szabad tanárok (nincs még osztályuk)
		const freeTeachers = teachers.filter((t) => !assignedTeacherIds.includes(t.id));

		const stats = {
			totalUsers: await db.users.count(),
			totalClasses: await db.classes.count(),
			totalSubjects: await db.subjects.count(),
			totalAssignments: await db.teacher_subjects.count(),
		};

		res.render("admin/admin-classes", { classes, teachers, freeTeachers, stats });
	} catch (error) {
		console.error("Hiba:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { adminClasses };
