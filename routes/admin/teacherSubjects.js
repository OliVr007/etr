// Tanár-tantárgy hozzárendelés létrehozása
async function createTeacherSubject(req, res) {
	try {
		const db = req.db;
		const { teacher_id, subject_id, class_id, academic_year } = req.body;

		if (!teacher_id || !subject_id || !class_id || !academic_year) {
			return res.status(400).json({ error: "Minden mező kitöltése kötelező" });
		}

		// Duplikáció ellenőrzés
		const existing = await db.teacher_subjects.findFirst({
			where: {
				teacher_id: parseInt(teacher_id),
				subject_id: parseInt(subject_id),
				class_id: parseInt(class_id),
				academic_year,
			},
		});

		if (existing) {
			return res.status(400).json({ error: "Ez a hozzárendelés már létezik" });
		}

		const newAssignment = await db.teacher_subjects.create({
			data: {
				teacher_id: parseInt(teacher_id),
				subject_id: parseInt(subject_id),
				class_id: parseInt(class_id),
				academic_year,
			},
		});

		res.json({ success: true, assignment: newAssignment });
	} catch (error) {
		console.error("Hiba a hozzárendelés létrehozásakor:", error);
		res.status(500).json({ error: "Hiba történt a hozzárendelés létrehozásakor" });
	}
}

// Tanár-tantárgy hozzárendelés frissítése
async function updateTeacherSubject(req, res) {
	try {
		const db = req.db;
		const assignmentId = parseInt(req.params.id);
		const { teacher_id, subject_id, class_id, academic_year } = req.body;

		if (!teacher_id || !subject_id || !class_id || !academic_year) {
			return res.status(400).json({ error: "Minden mező kitöltése kötelező" });
		}

		// Duplikáció ellenőrzés (saját ID kizárva)
		const existing = await db.teacher_subjects.findFirst({
			where: {
				teacher_id: parseInt(teacher_id),
				subject_id: parseInt(subject_id),
				class_id: parseInt(class_id),
				academic_year,
				NOT: { id: assignmentId },
			},
		});

		if (existing) {
			return res.status(400).json({ error: "Ez a hozzárendelés már létezik" });
		}

		const updated = await db.teacher_subjects.update({
			where: { id: assignmentId },
			data: {
				teacher_id: parseInt(teacher_id),
				subject_id: parseInt(subject_id),
				class_id: parseInt(class_id),
				academic_year,
			},
		});

		res.json({ success: true, assignment: updated });
	} catch (error) {
		console.error("Hiba a hozzárendelés frissítésekor:", error);
		res.status(500).json({ error: "Hiba történt a hozzárendelés frissítésekor" });
	}
}

// Tanár-tantárgy hozzárendelés törlése
async function deleteTeacherSubject(req, res) {
	try {
		const db = req.db;
		const assignmentId = parseInt(req.params.id);

		await db.teacher_subjects.delete({
			where: { id: assignmentId },
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Hiba a hozzárendelés törlésekor:", error);
		res.status(500).json({ error: "Hiba történt a hozzárendelés törlésekor" });
	}
}

module.exports = { createTeacherSubject, updateTeacherSubject, deleteTeacherSubject };