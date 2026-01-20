async function getTeacherHomeworks(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const homeworks = await req.db.homework.findMany({
			where: { teacher_id: req.session.id },
			include: {
				submissions: {
					include: {
						users: { select: { first_name: true, last_name: true } },
					},
				},
			},
			orderBy: { created_at: "desc" },
		});

		// Ha van class_id, külön lekérjük az osztály nevét
		const formatted = await Promise.all(
			homeworks.map(async (hw) => {
				let class_name = null;
				if (hw.class_id) {
					const cls = await req.db.classes.findUnique({
						where: { id: hw.class_id },
						select: { class_name: true },
					});
					class_name = cls?.class_name || null;
				}

				return {
					id: hw.id,
					subject: hw.subject,
					title: hw.title,
					description: hw.description,
					due_date: hw.due_date,
					created_at: hw.created_at,
					class_name: class_name,
					submissions: hw.submissions.map((sub) => ({
						id: sub.id,
						student_id: sub.student_id,
						student_name: `${sub.users.last_name} ${sub.users.first_name}`,
						status: sub.status,
						submitted_at: sub.submitted_at,
					})),
				};
			}),
		);

		return res.status(200).json({ homeworks: formatted });
	} catch (error) {
		console.error("Hiba a házi feladatok lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getTeacherHomeworks };
