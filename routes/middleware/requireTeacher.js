// Tanári jogosultság ellenőrzése
function requireTeacher(req, res, next) {
	// Ellenőrizzük, hogy be van-e jelentkezve
	if (!req.session.id) {
		return res.redirect("/login");
	}

	// Ellenőrizzük, hogy tanár-e
	if (req.session.role !== "teacher") {
		return res.status(403).send("Hozzáférés megtagadva. Csak tanároknak.");
	}

	next();
}

module.exports = { requireTeacher };
