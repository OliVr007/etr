// Diák főoldal
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

		// Legutóbbi házi feladatok lekérése
		const recentHomework = await db.homework_submissions.findMany({
			where: {
				student_id: req.session.id,
			},
			include: {
				homework: {
					include: {
						subjects: true,
					},
				},
			},
			orderBy: {
				id: "desc",
			},
			take: 3,
		});

		// Házi feladatok számának lekérése (beadásra váró)
		const totalHomework = await db.homework_submissions.count({
			where: {
				student_id: req.session.id,
				status: "pending",
			},
		});

		// Üzenetek lekérése
		const recentMessages = await db.messages.findMany({
			where: {
				receiver_id: req.session.id,
			},
			include: {
				users_messages_sender_idTousers: {
					select: {
						first_name: true,
						last_name: true,
					},
				},
			},
			orderBy: {
				created_at: "desc",
			},
			take: 3,
		});

		// Olvasatlan üzenetek számának lekérése
		const totalMessages = await db.messages.count({
			where: {
				receiver_id: req.session.id,
				is_read: false,
			},
		});

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
			recentHomework: recentHomework,
			recentMessages: recentMessages,
			totalGrades: totalGrades,
			totalHomework: totalHomework,
			totalMessages: totalMessages,
		});
	} catch (error) {
		console.error("Hiba az adatok lekérésekor:", error);
		res.render("student/index", {
			username: req.session.username,
			first_name: req.session.first_name || req.session.username,
			recentGrades: [],
			recentHomework: [],
			recentMessages: [],
			totalGrades: 0,
			totalHomework: 0,
			totalMessages: 0,
		});
	}
}

module.exports = { studentIndex };
