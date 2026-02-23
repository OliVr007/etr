function requireTeacher(req, res, next) {
	if (!req.session.id) {
		if (req.path.startsWith("/api/")) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		return res.redirect("/login");
	}
	if (req.session.role !== "teacher") {
		return res.status(403).send("Hozzáférés megtagadva. Csak tanároknak.");
	}
	next();
}

module.exports = { requireTeacher };
