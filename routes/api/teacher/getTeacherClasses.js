async function getTeacherClasses(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		// Tanár osztályainak lekérése
		const classes = await req.db.timetable.findMany({
			where: {
				teacher_id: req.session.id,
			},
			include: {
				classes: true,
			},
			distinct: ["class_id"],
		});

		const uniqueClasses = classes.map((tc) => ({
			id: tc.class_id,
			name: tc.classes.class_name,
		}));

		return res.status(200).json({ classes: uniqueClasses });
	} catch (error) {
		console.error("Hiba az osztályok lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getTeacherClasses };
