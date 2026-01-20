async function getStudentHomeworks(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const submissions = await req.db.homework_submissions.findMany({
			where: { student_id: req.session.id },
			include: {
				homework: {
					include: {
						users: { select: { first_name: true, last_name: true } },
					},
				},
			},
			orderBy: { homework: { due_date: "asc" } },
		});

		const formatted = submissions.map((sub) => ({
			id: sub.id,
			homework_id: sub.homework_id,
			subject: sub.homework.subject,
			title: sub.homework.title,
			description: sub.homework.description,
			due_date: sub.homework.due_date,
			teacher_name: `${sub.homework.users.last_name} ${sub.homework.users.first_name}`,
			status: sub.status,
			submitted_at: sub.submitted_at,
		}));

		return res.status(200).json({ homeworks: formatted });
	} catch (error) {
		console.error("Hiba a házi feladatok lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getStudentHomeworks };
