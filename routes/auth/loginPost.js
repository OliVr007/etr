const { compare } = require("bcrypt");
const { getSessionByRole } = require("../helpers/sessionHelper");

async function loginPost(req, res) {
	const db = req.db;
	const data = await db.users.findFirst({
		where: { username: req.body.username },
	});

	let errorMessage = null;

	if (!data) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	} else if (!(await compare(req.body.password, data.password_hash))) {
		errorMessage = "Hibás felhasználónév vagy jelszó!";
	}

	if (errorMessage) {
		return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
	}

	// FONTOS: szerepkör alapján kérjük le a megfelelő session-t
	const session = await getSessionByRole(req, res, data.role);

	session.id = data.id;
	session.username = data.username;
	session.first_name = data.first_name;
	session.last_name = data.last_name;
	session.role = data.role;

	await session.save();

	if (data.role === "admin") {
		return res.redirect("/admin");
	} else if (data.role === "teacher") {
		return res.redirect("/teacher");
	} else {
		return res.redirect("/");
	}
}

module.exports = { loginPost };
