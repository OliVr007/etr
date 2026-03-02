async function deleteClass(req, res) {
	try {
		const db = req.db;
		const classId = parseInt(req.params.id);

		// Ellenőrzés: létezik-e az osztály
		const existing = await db.classes.findUnique({
			where: { id: classId },
		});

		if (!existing) {
			return res.status(404).json({ error: "Az osztály nem található." });
		}

		await db.classes.delete({
			where: { id: classId },
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Hiba az osztály törlésekor:", error);
		res.status(500).json({ error: "Hiba történt az osztály törlésekor. Lehet, hogy van hozzá kapcsolódó adat." });
	}
}

module.exports = { deleteClass };
