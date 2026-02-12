// Osztály törlése
async function deleteClass(req, res) {
	try {
		const db = req.db;
		const classId = parseInt(req.params.id);

		await db.classes.delete({
			where: { id: classId },
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Hiba az osztály törlésekor:", error);
		res.status(500).json({ error: "Hiba történt az osztály törlésekor. Lehet, hogy van hozzá kapcsolódó adat (diákok, órarend)." });
	}
}

module.exports = { deleteClass };