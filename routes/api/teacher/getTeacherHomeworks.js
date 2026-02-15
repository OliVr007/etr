async function getTeacherHomeworks(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const homeworks = await req.db.homework.findMany({
			where: { teacher_id: req.session.id },
			include: {
				subjects: true, // JAVÍTVA: subjects tábla hozzáadva
				classes: true, // JAVÍTVA: classes is include-olva, hogy ne kelljen külön lekérni
				submissions: {
					include: {
						users: { select: { first_name: true, last_name: true } },
					},
				},
			},
			orderBy: { created_at: "desc" },
		});

		const formatted = homeworks.map((hw) => ({
			id: hw.id,
			subject: hw.subjects?.subject_name || "N/A", // JAVÍTVA: hw.subject helyett hw.subjects?.subject_name
			title: hw.title,
			description: hw.description,
			due_date: hw.due_date,
			created_at: hw.created_at,
			class_name: hw.classes?.class_name || null, // JAVÍTVA: már include-olva van, nem kell külön lekérni
			submissions: hw.submissions.map((sub) => ({
				id: sub.id,
				student_id: sub.student_id,
				student_name: `${sub.users.last_name} ${sub.users.first_name}`,
				status: sub.status,
				submitted_at: sub.submitted_at,
			})),
		}));

		return res.status(200).json({ homeworks: formatted });
	} catch (error) {
		console.error("Hiba a házi feladatok lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getTeacherHomeworks };
