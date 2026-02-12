// Admin főoldal - felhasználók, osztályok, tantárgyak, hozzárendelések
async function adminIndex(req, res) {
	try {
		const db = req.db;

		// Felhasználók
		const users = await db.users.findMany({
			orderBy: [{ role: "asc" }, { last_name: "asc" }],
			select: {
				id: true,
				username: true,
				first_name: true,
				last_name: true,
				email: true,
				role: true,
			},
		});

		// Osztályok (osztályfőnökkel)
		const classes = await db.classes.findMany({
			orderBy: { class_name: "asc" },
			select: {
				id: true,
				class_name: true,
				academic_year: true,
				room_number: true,
				class_teacher_id: true,
				users: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
			},
		});

		// Tanárok
		const teachers = await db.users.findMany({
			where: { role: "teacher" },
			orderBy: { last_name: "asc" },
			select: {
				id: true,
				first_name: true,
				last_name: true,
			},
		});

		// Tantárgyak
		const subjects = await db.subjects.findMany({
			orderBy: { subject_name: "asc" },
			select: {
				id: true,
				subject_code: true,
				subject_name: true,
				is_active: true,
				credits: true,
				description: true,
			},
		});

		// Tanár-tantárgy hozzárendelések
		const teacherSubjects = await db.teacher_subjects.findMany({
			orderBy: { academic_year: "desc" },
			include: {
				users: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
					},
				},
				subjects: {
					select: {
						id: true,
						subject_name: true,
						subject_code: true,
					},
				},
				classes: {
					select: {
						id: true,
						class_name: true,
					},
				},
			},
		});

		const stats = {
			totalUsers: users.length,
			students: users.filter((u) => u.role === "student").length,
			teachers: users.filter((u) => u.role === "teacher").length,
			admins: users.filter((u) => u.role === "admin").length,
			totalClasses: classes.length,
			totalSubjects: subjects.length,
			totalAssignments: teacherSubjects.length,
		};

		res.render("admin/admin-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			users,
			classes,
			teachers,
			subjects,
			teacherSubjects,
			stats,
		});
	} catch (error) {
		console.error("Hiba az admin oldal betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { adminIndex };