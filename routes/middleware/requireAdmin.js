// Admin jogosultság ellenőrzése
function requireAdmin(req, res, next) {
	// Ellenőrizzük, hogy be van-e jelentkezve
	if (!req.session.id) {
		return res.redirect("/login");
	}

	// Ellenőrizzük, hogy admin-e
	if (req.session.role !== "admin") {
		return res.status(403).send("Hozzáférés megtagadva. Csak adminisztrátoroknak.");
	}

	next();
}

module.exports = { requireAdmin };
