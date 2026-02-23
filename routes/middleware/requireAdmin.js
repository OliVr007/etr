function requireAdmin(req, res, next) {
	if (!req.session.id) {
		if (req.path.startsWith("/api/")) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		return res.redirect("/login");
	}
	if (req.session.role !== "admin") {
		return res.status(403).send("Hozzáférés megtagadva. Csak adminisztrátoroknak.");
	}
	next();
}

module.exports = { requireAdmin };
