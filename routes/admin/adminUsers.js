async function adminUsers(req, res) {
	try {
		const db = req.db;

		const users = await db.users.findMany({
			orderBy: [{ role: "asc" }, { last_name: "asc" }],
			select: { id: true, username: true, first_name: true, last_name: true, email: true, role: true },
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

		res.render("admin/admin-users", { users, classes, stats });
	} catch (error) {
		console.error("Hiba:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { adminUsers };
