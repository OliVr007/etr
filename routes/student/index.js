// Diák főoldal - áttekintés
async function studentIndex(req, res) {
	try {
		const db = req.db;
		// Legutóbbi jegyek lekérése
		const recentGrades = await db.grades.findMany({
			where: {
				student_id: req.session.id,
			},
			include: {
				subjects: true,
			},
			orderBy: {
				grade_date: "desc",
			},
			take: 3,
		});

		// Üzenetek lekérése (jelenleg üres)
		const recentMessages = [];

		// Összes jegy számának lekérése
		const totalGrades = await db.grades.count({
			where: {
				student_id: req.session.id,
			},
		});

		res.render("student/index", {
			username: req.session.username,
			first_name: req.session.first_name || req.session.username,
			recentGrades: recentGrades,
			recentMessages: recentMessages,
			totalGrades: totalGrades,
		});
	} catch (error) {
		console.error("Hiba az adatok lekérésekor:", error);
		res.render("student/index", {
			username: req.session.username,
			first_name: req.session.first_name || req.session.username,
			recentGrades: [],
			recentMessages: [],
			totalGrades: 0,
		});
	}
}

module.exports = { studentIndex };
