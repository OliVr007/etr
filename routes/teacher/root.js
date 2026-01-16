async function routeTeacher(req, res) {
	try {
		res.render("teacher/teacher-index", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
		});
	} catch (error) {
		console.error("Hiba a tanári felület betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { routeTeacher };