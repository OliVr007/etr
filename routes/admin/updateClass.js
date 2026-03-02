// Osztály frissítése
async function updateClass(req, res) {
	try {
		const db = req.db;
		const classId = parseInt(req.params.id);
		const { class_name, academic_year, class_teacher_id, room_number } = req.body;

		if (!class_name || !academic_year) {
			return res.status(400).json({ error: "Az osztály neve és a tanév megadása kötelező" });
		}

		// Duplikáció ellenőrzés (saját ID kizárva)
		const existing = await db.classes.findFirst({
			where: {
				class_name,
				academic_year,
				NOT: { id: classId },
			},
		});

		if (existing) {
			return res.status(400).json({ error: "Ez az osztály már létezik ebben a tanévben" });
		}

		const updated = await db.classes.update({
			where: { id: classId },
			data: {
				class_name,
				academic_year,
				class_teacher_id: class_teacher_id ? parseInt(class_teacher_id) : null,
				room_number: room_number || null,
			},
		});

		res.json({ success: true, class: updated });
	} catch (error) {
		console.error("Hiba az osztály frissítésekor:", error);
		res.status(500).json({ error: "Hiba történt az osztály frissítésekor" });
	}
}

module.exports = { updateClass };
