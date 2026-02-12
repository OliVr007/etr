// Tantárgy lekérése (egyedi)
async function getSubject(req, res) {
	try {
		const db = req.db;
		const subjectId = parseInt(req.params.id);

		const subject = await db.subjects.findUnique({
			where: { id: subjectId },
		});

		if (!subject) {
			return res.status(404).json({ error: "Tantárgy nem található" });
		}

		res.json(subject);
	} catch (error) {
		console.error("Hiba a tantárgy lekérésekor:", error);
		res.status(500).json({ error: "Hiba történt" });
	}
}

// Új tantárgy létrehozása
async function createSubject(req, res) {
	try {
		const db = req.db;
		const { subject_code, subject_name, credits, description } = req.body;

		if (!subject_code || !subject_name) {
			return res.status(400).json({ error: "A tantárgy kódja és neve kötelező" });
		}

		// Duplikáció ellenőrzés
		const existing = await db.subjects.findUnique({
			where: { subject_code },
		});

		if (existing) {
			return res.status(400).json({ error: "Ez a tantárgykód már létezik" });
		}

		const newSubject = await db.subjects.create({
			data: {
				subject_code,
				subject_name,
				credits: credits ? parseInt(credits) : 1,
				description: description || null,
				is_active: true,
			},
		});

		res.json({ success: true, subject: newSubject });
	} catch (error) {
		console.error("Hiba a tantárgy létrehozásakor:", error);
		res.status(500).json({ error: "Hiba történt a tantárgy létrehozásakor" });
	}
}

// Tantárgy frissítése
async function updateSubject(req, res) {
	try {
		const db = req.db;
		const subjectId = parseInt(req.params.id);
		const { subject_code, subject_name, credits, description, is_active } = req.body;

		if (!subject_code || !subject_name) {
			return res.status(400).json({ error: "A tantárgy kódja és neve kötelező" });
		}

		// Duplikáció ellenőrzés (saját ID kizárva)
		const existing = await db.subjects.findFirst({
			where: {
				subject_code,
				NOT: { id: subjectId },
			},
		});

		if (existing) {
			return res.status(400).json({ error: "Ez a tantárgykód már létezik" });
		}

		const updated = await db.subjects.update({
			where: { id: subjectId },
			data: {
				subject_code,
				subject_name,
				credits: credits ? parseInt(credits) : 1,
				description: description || null,
				is_active: is_active !== undefined ? is_active === true || is_active === "true" : true,
			},
		});

		res.json({ success: true, subject: updated });
	} catch (error) {
		console.error("Hiba a tantárgy frissítésekor:", error);
		res.status(500).json({ error: "Hiba történt a tantárgy frissítésekor" });
	}
}

// Tantárgy törlése
async function deleteSubject(req, res) {
	try {
		const db = req.db;
		const subjectId = parseInt(req.params.id);

		await db.subjects.delete({
			where: { id: subjectId },
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Hiba a tantárgy törlésekor:", error);
		res.status(500).json({ error: "Hiba történt a tantárgy törlésekor. Lehet, hogy van hozzá kapcsolódó adat." });
	}
}

module.exports = { getSubject, createSubject, updateSubject, deleteSubject };