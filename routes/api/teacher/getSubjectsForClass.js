async function getSubjectsForClass(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	const classId = parseInt(req.params.classId);

	try {
		const teacherSubjects = await req.db.teacher_subjects.findMany({
			where: {
				teacher_id: req.session.id,
				class_id: classId,
			},
			select: {
				subjects: {
					select: {
						id: true,
						subject_name: true,
					},
				},
			},
		});

		const subjects = teacherSubjects.map((ts) => ts.subjects);

		return res.json({ subjects });
	} catch (error) {
		console.error("Hiba:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getSubjectsForClass };
