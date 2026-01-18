// Bejelentkezési oldal megjelenítése
async function loginPage(req, res) {
	// Ha már be van jelentkezve, irányítsuk át
	const db = req.db;
	if (req.session.id) {
		return res.redirect("/");
	}

	const error = req.query.error || null;
	res.render("login", { error });
}

module.exports = { loginPage };
