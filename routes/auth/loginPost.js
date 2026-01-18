const { compare } = require("bcrypt");

// Bejelentkezés feldolgozása
async function loginPost(req, res) {
	// Felhasználó keresése az adatbázisban
	const db = req.db;
	const data = await db.users.findFirst({
		where: { username: req.body.username },
	});

	let errorMessage = null;

	// Ellenőrzések
	if (!data) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	} else if (!(await compare(req.body.password, data.password_hash))) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	}

	// Ha hiba van, visszairányítás hibaüzenettel
	if (errorMessage) {
		return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
	}

	// Session adatok beállítása
	req.session.id = data.id;
	req.session.username = data.username;
	req.session.first_name = data.first_name;
	req.session.last_name = data.last_name;
	req.session.role = data.role;

	await req.session.save();

	// Szerepkör alapú átirányítás
	if (data.role === "admin") {
		return res.redirect("/admin");
	} else if (data.role === "teacher") {
		return res.redirect("/teacher");
	} else {
		return res.redirect("/");
	}
}

module.exports = { loginPost };
