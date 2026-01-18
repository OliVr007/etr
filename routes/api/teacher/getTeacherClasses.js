async function getTeacherClasses(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		// Összes osztály lekérése (nem csak az órarendben szereplők)
		const classes = await req.db.classes.findMany({
			orderBy: { class_name: "asc" },
			select: {
				id: true,
				class_name: true,
			},
		});

		const formattedClasses = classes.map((cls) => ({
			id: cls.id,
			name: cls.class_name,
		}));

		return res.status(200).json({ classes: formattedClasses });
	} catch (error) {
		console.error("Hiba az osztályok lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getTeacherClasses };
