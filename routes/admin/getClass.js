// Osztály lekérése (egyedi)
async function getClass(req, res) {
	try {
		const db = req.db;
		const classId = parseInt(req.params.id);

		const cls = await db.classes.findUnique({
			where: { id: classId },
		});

		if (!cls) {
			return res.status(404).json({ error: "Osztály nem található" });
		}

		res.json(cls);
	} catch (error) {
		console.error("Hiba az osztály lekérésekor:", error);
		res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getClass };