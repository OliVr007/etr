async function getStudentsForClass(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	const classId = parseInt(req.params.classId);

	if (!classId || isNaN(classId)) {
		return res.status(400).json({ error: "Érvénytelen osztály ID" });
	}

	try {
		const students = await req.db.student_classes.findMany({
			where: {
				class_id: classId,
				is_active: true,
			},
			include: {
				users: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
					},
				},
			},
			orderBy: {
				users: {
					last_name: "asc",
				},
			},
		});

		const formattedStudents = students.map((s) => ({
			id: s.users.id,
			first_name: s.users.first_name,
			last_name: s.users.last_name,
		}));

		return res.status(200).json({ students: formattedStudents });
	} catch (error) {
		console.error("Hiba a diákok lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getStudentsForClass };
