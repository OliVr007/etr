// Régi /teacherui URL átirányítása az új /teacher címre
async function teacherLegacyRoot(req, res) {
	res.redirect("/teacher");
}

module.exports = { teacherLegacyRoot };
