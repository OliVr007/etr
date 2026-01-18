// Egy felhasználó adatainak lekérése ID alapján
async function getUser(req, res) {
	try {
		const db = req.db;
		const user = await db.users.findUnique({
			where: { id: parseInt(req.params.id) },
			select: {
				id: true,
				username: true,
				first_name: true,
				last_name: true,
				email: true,
				role: true,
			},
		});

		if (!user) {
			return res.status(404).json({ error: "Felhasználó nem található" });
		}

		res.json(user);
	} catch (error) {
		console.error("Hiba a felhasználó lekérésekor:", error);
		res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getUser };
