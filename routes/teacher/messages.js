async function teacherMessages(req, res) {
    try {
		res.render("teacher/teacher-messages", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
		});
	} catch (error) {
		console.error("Hiba az üzenetek betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { teacherMessages };