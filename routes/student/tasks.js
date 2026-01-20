async function studentTasks(req, res) {
	res.render("student/tasks", {
		username: req.session.username,
		first_name: req.session.first_name,
		last_name: req.session.last_name,
	});
}

module.exports = { studentTasks };
