async function getAllUsers(req, res) {
	if (!req.session.id) return res.status(401).json({ error: "unauthorized" });

	try {
		const users = await req.db.users.findMany({
			where: {
				NOT: {
					id: req.session.id,
				},
				is_active: true,
			},
			select: {
				id: true,
				first_name: true,
				last_name: true,
				role: true,
			},
			orderBy: [{ role: "asc" }, { last_name: "asc" }],
		});

		return res.status(200).json({ users });
	} catch (error) {
		console.error("Hiba a felhasználók lekérésekor:", error);
		return res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getAllUsers };
