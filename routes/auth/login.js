// Bejelentkezés
async function loginPage(req, res) {
	const db = req.db;
	if (req.session.id) {
		return res.redirect("/");
	}

	const error = req.query.error || null;
	res.render("login", { error });
}

module.exports = { loginPage };
