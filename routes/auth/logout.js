// Kijelentkezés
async function logout(req, res) {
	const db = req.db;
	await req.session.destroy();
	return res.redirect("/login");
}

module.exports = { logout };
