// Felhasználó törlése
async function deleteUser(req, res) {
	try {
		const db = req.db;
		const userId = parseInt(req.params.id);

		// Ne lehessen saját magát törölni
		if (userId === req.session.id) {
			return res.status(400).json({ error: "Nem törölheted a saját fiókodat" });
		}

		// Felhasználó törlése
		await db.users.delete({
			where: { id: userId },
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Hiba a felhasználó törlésekor:", error);
		res.status(500).json({ error: "Hiba történt a felhasználó törlésekor" });
	}
}

module.exports = { deleteUser };
