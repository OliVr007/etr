// Egy felhasználó adatainak lekérése ID alapján
async function getUser(req, res) {
	try {
		const db = req.db;
		const userId = parseInt(req.params.id);
		
		const user = await db.users.findUnique({
			where: { id: userId },
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

		// Ha diák, akkor lekérjük az osztályát is
		if (user.role === 'student') {
			const studentClass = await db.student_classes.findFirst({
				where: {
					student_id: userId,
					is_active: true,
				},
				select: {
					class_id: true,
				},
			});

			user.class_id = studentClass ? studentClass.class_id : null;
		}

		res.json(user);
	} catch (error) {
		console.error("Hiba a felhasználó lekérésekor:", error);
		res.status(500).json({ error: "Hiba történt" });
	}
}

module.exports = { getUser };
