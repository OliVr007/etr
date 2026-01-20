async function createHomework(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const { class_id, student_id, subject, title, description, due_date } = req.body;

		// Validáció
		if (!subject || !title || !description || !due_date) {
			return res.status(400).json({ error: "Hiányzó mezők" });
		}

		if (!class_id && !student_id) {
			return res.status(400).json({ error: "Válassz osztályt vagy diákot" });
		}

		// Házi feladat létrehozása
		const homework = await req.db.homework.create({
			data: {
				teacher_id: req.session.id,
				class_id: class_id ? parseInt(class_id) : null,
				student_id: student_id ? parseInt(student_id) : null,
				subject,
				title,
				description,
				due_date: new Date(due_date),
			},
		});

		// Submission rekordok létrehozása a diákoknak
		if (class_id) {
			// Egész osztálynak
			const students = await req.db.student_classes.findMany({
				where: { class_id: parseInt(class_id), is_active: true },
				select: { student_id: true },
			});

			for (const student of students) {
				await req.db.homework_submissions.create({
					data: {
						homework_id: homework.id,
						student_id: student.student_id,
						status: "pending",
					},
				});
			}
		} else if (student_id) {
			// Egy diáknak
			await req.db.homework_submissions.create({
				data: {
					homework_id: homework.id,
					student_id: parseInt(student_id),
					status: "pending",
				},
			});
		}

		return res.status(201).json({ success: true, homework });
	} catch (error) {
		console.error("Hiba a házi feladat létrehozásakor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { createHomework };
