async function adminSubjects(req, res) {
	try {
		const db = req.db;

		const subjects = await db.subjects.findMany({
			orderBy: { subject_name: "asc" },
			select: { id: true, subject_code: true, subject_name: true, is_active: true, description: true },
		});

		const stats = {
			totalUsers: await db.users.count(),
			totalClasses: await db.classes.count(),
			totalSubjects: await db.subjects.count(),
			totalAssignments: await db.teacher_subjects.count(),
		};

		res.render("admin/admin-subjects", { subjects, stats });
	} catch (error) {
		console.error("Hiba:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { adminSubjects };
