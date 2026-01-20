async function teacherHomework(req, res) {
	try {
		res.render("teacher/teacher-homework", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
		});
	} catch (error) {
		console.error("Hiba a házi feladatok betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { teacherHomework };
