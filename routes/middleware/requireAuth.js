// Általános bejelentkezés ellenőrzése
function requireAuth(req, res, next) {
	if (!req.session.id) {
		return res.redirect("/login");
	}
	next();
}

module.exports = { requireAuth };
