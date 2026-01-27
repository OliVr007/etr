// Új osztály létrehozása
async function createClass(req, res) {
	try {
		const db = req.db;
		const { class_name, academic_year, class_teacher_id, room_number } = req.body;

		// Kötelező mezők ellenőrzése
		if (!class_name || !academic_year) {
			return res.status(400).json({ error: "Az osztály neve és a tanév megadása kötelező" });
		}

		// Ellenőrizzük, hogy létezik-e már ilyen osztály ebben a tanévben
		const existingClass = await db.classes.findFirst({
			where: {
				class_name: class_name,
				academic_year: academic_year,
			},
		});

		if (existingClass) {
			return res.status(400).json({ error: "Ez az osztály már létezik ebben a tanévben" });
		}

		// Új osztály létrehozása
		const newClass = await db.classes.create({
			data: {
				class_name: class_name,
				academic_year: academic_year,
				class_teacher_id: class_teacher_id ? parseInt(class_teacher_id) : null,
				room_number: room_number || null,
			},
		});

		res.json({ success: true, class: newClass });
	} catch (error) {
		console.error("Hiba az osztály létrehozásakor:", error);
		res.status(500).json({ error: "Hiba történt az osztály létrehozásakor" });
	}
}

module.exports = { createClass };
