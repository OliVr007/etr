const { hash } = require("bcrypt");

// Új felhasználó létrehozása
async function createUser(req, res) {
	try {
		const db = req.db;
		const { username, password, first_name, last_name, email, role } = req.body;

		// Kötelező mezők ellenőrzése
		if (!username || !password || !first_name || !last_name || !role) {
			return res.status(400).json({ error: "Minden kötelező mezőt ki kell tölteni" });
		}

		// Ellenőrizzük, hogy létezik-e már ilyen felhasználónév
		const existingUser = await db.users.findUnique({
			where: { username: username },
		});

		if (existingUser) {
			return res.status(400).json({ error: "Ez a felhasználónév már foglalt" });
		}

		// Jelszó titkosítása
		const hashedPassword = await hash(password, 10);

		// Új felhasználó létrehozása
		const newUser = await db.users.create({
			data: {
				username: username,
				password_hash: hashedPassword,
				first_name: first_name,
				last_name: last_name,
				email: email || null,
				role: role,
			},
		});

		res.json({ success: true, user: newUser });
	} catch (error) {
		console.error("Hiba a felhasználó létrehozásakor:", error);
		res.status(500).json({ error: "Hiba történt a felhasználó létrehozásakor" });
	}
}

module.exports = { createUser };
