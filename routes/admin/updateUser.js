const { hash } = require("bcrypt");

// Felhasználó adatainak frissítése
async function updateUser(req, res) {
	try {
		const db = req.db;
		const userId = parseInt(req.params.id);
		const { username, password, first_name, last_name, email, role } = req.body;

		// Kötelező mezők ellenőrzése
		if (!username || !first_name || !last_name || !role) {
			return res.status(400).json({ error: "Minden kötelező mezőt ki kell tölteni" });
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

		res.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error("Hiba a felhasználó frissítésekor:", error);
		res.status(500).json({ error: "Hiba történt a felhasználó frissítésekor" });
	}
}

module.exports = { updateUser };
