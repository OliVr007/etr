function requireAuth(req, res, next) {
	if (!req.session.id) {
		if (req.path.startsWith("/api/")) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		return res.redirect("/login");
	}
	next();
}

module.exports = { requireAuth };
