async function teacherMessagesNew(req, res) {
	try {
		res.render("teacher/teacher-messages-new", {
			username: req.session.username,
			first_name: req.session.first_name,
			last_name: req.session.last_name,
		});
	} catch (error) {
		console.error("Hiba az üzenetküldő felület betöltésekor:", error);
		res.status(500).send("Hiba történt");
	}
}

module.exports = { teacherMessagesNew };
