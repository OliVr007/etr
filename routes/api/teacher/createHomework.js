async function createHomework(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const { class_id, student_id, subject_id, title, description, due_date } = req.body;

		if (!subject_id || !title || !description || !due_date) {
			return res.status(400).json({ error: "Hiányzó mezők" });
		}

		if (!class_id && !student_id) {
			return res.status(400).json({ error: "Válassz osztályt vagy diákot" });
		}

		// Házi feladat létrehozása
		const homeworkData = {
			users: {
				connect: { id: req.session.id },
			},
			subjects: {
				connect: { id: parseInt(subject_id) },
			},
			title,
			description,
			due_date: new Date(due_date),
		};

		// Osztály kapcsolása ha van
		if (class_id) {
			homeworkData.classes = {
				connect: { id: parseInt(class_id) },
			};
		}

		const homework = await req.db.homework.create({
			data: homeworkData,
		});

		if (class_id) {
			const students = await req.db.student_classes.findMany({
				where: { class_id: parseInt(class_id), is_active: true },
				select: { student_id: true },
			});

			if (students.length > 0) {
				await req.db.homework_submissions.createMany({
					data: students.map((student) => ({
						homework_id: homework.id,
						student_id: student.student_id,
						status: "pending",
					})),
				});
			}
		} else if (student_id) {
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
