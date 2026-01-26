const { hash } = require("bcrypt");

// Felhasználó adatainak frissítése
async function updateUser(req, res) {
	try {
		const db = req.db;
		const userId = parseInt(req.params.id);
		const { username, password, first_name, last_name, email, role, class_id } = req.body;

		// Kötelező mezők ellenőrzése
		if (!username || !first_name || !last_name || !role) {
			return res.status(400).json({ error: "Minden kötelező mezőt ki kell tölteni" });
		}

		// Ha diák és nincs osztály megadva, hiba
		if (role === 'student' && !class_id) {
			return res.status(400).json({ error: "Diák felhasználóhoz kötelező osztályt megadni" });
		}

		// Ellenőrizzük, hogy a felhasználónév foglalt-e (kivéve a saját felhasználónevet)
		const existingUser = await db.users.findFirst({
			where: {
				username: username,
				NOT: { id: userId },
			},
		});

		if (existingUser) {
			return res.status(400).json({ error: "Ez a felhasználónév már foglalt" });
		}

		// Frissítendő adatok összeállítása
		const updateData = {
			username: username,
			first_name: first_name,
			last_name: last_name,
			email: email || null,
			role: role,
		};

		// Ha új jelszót adtak meg, azt is frissítjük
		if (password && password.trim() !== "") {
			updateData.password_hash = await hash(password, 10);
		}

		// Felhasználó frissítése
		const updatedUser = await db.users.update({
			where: { id: userId },
			data: updateData,
		});

		// Ha diák, akkor az osztályba tartozást is frissítjük
		if (role === 'student' && class_id) {
			// Előző aktív osztályba tartozás inaktiválása
			await db.student_classes.updateMany({
				where: {
					student_id: userId,
					is_active: true,
				},
				data: {
					is_active: false,
				},
			});

			// Új osztályba tartozás létrehozása vagy aktiválása
			const existingClassAssignment = await db.student_classes.findFirst({
				where: {
					student_id: userId,
					class_id: parseInt(class_id),
				},
			});

			if (existingClassAssignment) {
				await db.student_classes.update({
					where: { id: existingClassAssignment.id },
					data: { is_active: true },
				});
			} else {
				await db.student_classes.create({
					data: {
						student_id: userId,
						class_id: parseInt(class_id),
						academic_year: "2024/2025",
						enrollment_date: new Date(),
						is_active: true,
					},
				});
			}
		} else if (role !== 'student') {
			// Ha már nem diák, inaktiváljuk az összes osztályba tartozást
			await db.student_classes.updateMany({
				where: {
					student_id: userId,
					is_active: true,
				},
				data: {
					is_active: false,
				},
			});
		}

		res.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error("Hiba a felhasználó frissítésekor:", error);
		res.status(500).json({ error: "Hiba történt a felhasználó frissítésekor" });
	}
}

module.exports = { updateUser };
